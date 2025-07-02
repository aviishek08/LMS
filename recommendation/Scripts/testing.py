import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import Reader, Dataset, SVD
import math
import warnings

warnings.simplefilter('ignore')

# Hybrid function for a given user
def hybrid(userId, train_rd):
    # Load metadata
    md = pd.read_csv('CustomData/FinalData.csv')
    fd = pd.read_csv('avg_ratings1.csv')
    fd1 = pd.read_csv('ratings_count.csv')

    # Compute average rating C and minimum votes m
    fd['rating'] = fd['rating'].astype(float)
    fd1['rating'] = fd1['rating'].astype(float)
    C = fd['rating'].mean()
    m = fd1['rating'].quantile(0.75)

    md['ratings_count'] = fd1['rating']
    md['average_rating'] = fd['rating']

    qualified = md[(md['ratings_count'].notnull())][['book_id', 'title', 'authors', 'ratings_count', 'average_rating']]
    qualified['ratings_count'] = qualified['ratings_count'].astype(float)
    qualified['average_rating'] = qualified['average_rating'].astype(float)

    # Weighted rating function
    def weighted_rating(x):
        v = x['ratings_count']
        R = x['average_rating']
        return (v / (v + m) * R) + (m / (m + v) * C)

    qualified['popularity_rating'] = qualified.apply(weighted_rating, axis=1)
    pop = qualified[['book_id', 'popularity_rating']]

    ### Collaborative Filtering ###
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(train_rd[['user_id', 'book_id', 'rating']], reader)

    trainset = data.build_full_trainset()
    algo = SVD()
    algo.fit(trainset)

    testset = trainset.build_anti_testset()
    predictions = algo.test(testset)

    # Save predictions for this user
    temp_ratings = pd.DataFrame(columns=['user_id', 'book_id', 'rating'])
    for uid, iid, true_r, est, _ in predictions:
        if uid == userId:
            temp_ratings = temp_ratings.append({'user_id': uid, 'book_id': iid, 'rating': est}, ignore_index=True)

    ##### CONTENT-BASED ######
    md['authors'] = md['authors'].str.replace(' ', '').str.lower().str.replace(',', ' ')
    md['Genres'] = md['Genres'].str.split(';')
    md['soup'] = md['authors'] + md['Genres']
    md['soup'] = md['soup'].str.join(' ')

    count = CountVectorizer(analyzer='word', ngram_range=(1, 1), stop_words='english')
    count_matrix = count.fit_transform(md['soup'])
    cosine_sim = cosine_similarity(count_matrix, count_matrix)

    book_ids = md['book_id'].tolist()

    # Build user profile (content-based)
    def build_user_profile(user_id):
        user_profile = np.zeros(len(book_ids))
        user_ratings = train_rd[train_rd['user_id'] == user_id]
        for _, row in user_ratings.iterrows():
            book_index = row['book_id'] - 1
            if book_index < len(user_profile):
                user_profile[book_index] = row['rating']
        return user_profile

    def get_content_scores(person_id):
        user_profile_vec = build_user_profile(person_id)
        user_ratings = np.empty(len(book_ids))
        for i in range(len(book_ids)):
            book_sim = cosine_sim[i]
            user_sim = user_profile_vec
            if sum(book_sim) == 0:
                user_ratings[i] = 0
            else:
                user_ratings[i] = (book_sim.dot(user_sim)) / sum(book_sim)
        max_val = max(user_ratings)
        if max_val > 0:
            user_ratings = (user_ratings * 5.0) / max_val
        return user_ratings

    content_ratings = get_content_scores(userId)

    # Combine ratings
    num = md[['book_id']]
    num1 = pd.DataFrame(data=content_ratings)
    mer = pd.concat([num.reset_index(drop=True), num1], axis=1)
    mer.columns = ['book_id', 'content_rating']

    # For user
    cb = temp_ratings[['book_id', 'rating']]
    hyb = md[['book_id']].merge(cb, on='book_id', how='left').merge(pop, on='book_id', how='left').merge(mer, on='book_id', how='left')
    hyb.fillna(0, inplace=True)

    # Hybrid weighted rating
    def final_weighted_rating(x):
        v = x['rating']
        R = x['popularity_rating']
        c = x['content_rating']
        return 0.4 * v + 0.2 * R + 0.4 * c

    hyb['final'] = hyb.apply(final_weighted_rating, axis=1)
    hyb = hyb.sort_values('final', ascending=False).head(999)

    # Return final dataframe
    return hyb

# Load ratings
rd = pd.read_csv('CustomData/FinalRatings.csv')
train_rd, test_rd = np.split(rd.sample(frac=1, random_state=42), [int(.8 * len(rd))])

users_selected = [1]
avg_rmse = 0

for i in users_selected:
    ms = 0
    cnt = 0
    # Build predicted hybrid recommendations
    predicted_df = hybrid(i, train_rd)

    # Build user profile vector from original ratings
    user_profile_vec = np.zeros(len(predicted_df))
    user_ratings_df = train_rd[train_rd['user_id'] == i]

    for _, row in user_ratings_df.iterrows():
        if row['book_id'] - 1 < len(user_profile_vec):
            user_profile_vec[row['book_id'] - 1] = row['rating']

    # Calculate RMSE
    for _, row in predicted_df.iterrows():
        book_id = int(row['book_id'])
        actual_rating = user_profile_vec[book_id - 1]
        predicted_rating = row['final']
        if actual_rating > 0:
            ms += (predicted_rating - actual_rating) ** 2
            cnt += 1

    rmse = math.sqrt(ms / cnt) if cnt > 0 else 0
    avg_rmse += rmse

avg_rmse /= len(users_selected)

print("\n---------\n")
print("Avg RMSE: " + str(avg_rmse))
print("\n---------\n")
