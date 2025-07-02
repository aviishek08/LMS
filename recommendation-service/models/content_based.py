import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def build_content_model(books_df):
    books_df["combined"] = books_df["title"] + " " + books_df["author"] + " " + books_df["description"]
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(books_df["combined"])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return tfidf, cosine_sim

def get_content_recommendations(book_title, books_df, tfidf_matrix, cosine_sim):
    idx = books_df[books_df["title"] == book_title].index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:6]
    book_indices = [i[0] for i in sim_scores]
    return books_df.iloc[book_indices][["title", "author"]].to_dict(orient="records")
