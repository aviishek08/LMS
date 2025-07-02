from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from surprise import Reader, Dataset, SVD
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings

warnings.simplefilter('ignore')

app = Flask(__name__)

# ================================
# Load Data Once at Startup
# ================================

print("Loading data...")

# Book metadata
md = pd.read_csv('CustomData/FinalData.csv')
ratings = pd.read_csv('CustomData/FinalRatings.csv')
avg_ratings = pd.read_csv('CustomData/AverageRatings.csv')
ratings_count = pd.read_csv('CustomData/RatingsCount.csv')

# Prepare popularity-based ratings
avg_ratings['rating'] = avg_ratings['rating'].astype(float)
C = avg_ratings['rating'].mean()
ratings_count['rating'] = ratings_count['rating'].astype(float)
vote_counts = ratings_count['rating']
m = len(vote_counts)

md['ratings_count'] = ratings_count['rating']
md['average_rating'] = avg_ratings['rating']

qualified = md[md['ratings_count'].notnull()]
qualified['ratings_count'] = qualified['ratings_count'].astype(float)
qualified['average_rating'] = qualified['average_rating'].astype(float)

def weighted_rating(x):
    v = x['ratings_count']
    R = x['average_rating']
    return (v / (v + m) * R) + (m / (m + v) * C)

qualified['popularity_rating'] = qualified.apply(weighted_rating, axis=1)
popularity_df = qualified[['book_id', 'popularity_rating']]

# Content-based preprocessing
md['authors'] = md['authors'].str.replace(' ', '').str.lower().str.replace(',', ' ')
md['Genres'] = md['Genres'].str.split(';')
md['authors'] = md['authors'].apply(lambda x: [x, x])
md['soup'] = (md['authors'] + md['Genres']).str.join(' ')
count_vectorizer = CountVectorizer(analyzer='word', stop_words='english')
count_matrix = count_vectorizer.fit_transform(md['soup'])
cosine_sim = cosine_similarity(count_matrix, count_matrix)

print("Data loaded successfully.")

# ================================
# Recommendation Endpoint
# ================================

@app.route('/recommend', methods=['POST'])
def recommend():
    user_id = int(request.json['user_id'])
    temp_ratings = ratings.copy()

    # Collaborative Filtering
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(temp_ratings[['user_id', 'book_id', 'rating']], reader)
    trainset = data.build_full_trainset()
    algo = SVD()
    algo.fit(trainset)

    testset = trainset.build_anti_testset()
    predictions = algo.test(testset)

    # Add predicted ratings for this user
    for uid, iid, true_r, est, _ in predictions:
        if int(uid) == user_id:
            temp_ratings.loc[len(temp_ratings)] = [uid, iid, est]

    collaborative_df = temp_ratings[temp_ratings['user_id'] == user_id][['book_id', 'rating']]

    # Content-based Profile
    user_profile = np.zeros(999)
    for i in range(len(temp_ratings)):
        if int(temp_ratings.iloc[i]['user_id']) == user_id:
            b = int(temp_ratings.iloc[i]['book_id'])
            if b <= 999:
                user_profile[b - 1] = temp_ratings.iloc[i]['rating']

    content_ratings = np.zeros((999, 1))
    for i in range(999):
        book_sim = cosine_sim[i]
        user_sim = user_profile
        if sum(cosine_sim[i]) != 0:
            content_ratings[i] = (book_sim @ user_sim) / sum(cosine_sim[i])
    maxval = max(content_ratings)
    if maxval != 0:
        content_ratings = (content_ratings * 5.0) / maxval

    content_df = pd.DataFrame({'book_id': md['book_id'].values[:999], 'content_rating': content_ratings.flatten()})

    # Combine All
    hyb = md[['book_id', 'title', 'Genres']].copy()
    hyb = hyb.merge(collaborative_df, on='book_id', how='left')
    hyb = hyb.merge(popularity_df, on='book_id', how='left')
    hyb = hyb.merge(content_df, on='book_id', how='left')
    hyb = hyb.fillna(0)

    def final_score(x):
        return 0.4 * x['rating'] + 0.2 * x['popularity_rating'] + 0.4 * x['content_rating']

    hyb['hyb_rating'] = hyb.apply(final_score, axis=1)
    hyb = hyb.sort_values('hyb_rating', ascending=False).head(10)

    results = hyb[['book_id', 'title', 'Genres', 'hyb_rating']].to_dict(orient='records')
    return jsonify(results)

# ================================
# Run
# ================================

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
