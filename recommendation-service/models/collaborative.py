import pandas as pd
from sklearn.neighbors import NearestNeighbors

def build_user_item_matrix(borrow_df):
    borrow_df["interaction"] = 1
    matrix = borrow_df.pivot_table(index="user_id", columns="book_id", values="interaction", fill_value=0)
    return matrix

def build_knn_model(user_item_matrix):
    model = NearestNeighbors(metric='cosine', algorithm='brute')
    model.fit(user_item_matrix)
    return model

def get_collab_recommendations(user_id, user_item_matrix, model, books_df):
    user_idx = list(user_item_matrix.index).index(user_id)
    distances, indices = model.kneighbors([user_item_matrix.iloc[user_idx]], n_neighbors=3)
    similar_users = user_item_matrix.iloc[indices[0]]
    book_scores = similar_users.sum().sort_values(ascending=False)
    user_books = set(user_item_matrix.columns[user_item_matrix.iloc[user_idx] == 1])
    recommendations = [book for book in book_scores.index if book not in user_books]
    rec_books = books_df[books_df["book_id"].isin(recommendations)].head(5)
    return rec_books[["title", "author"]].to_dict(orient="records")
