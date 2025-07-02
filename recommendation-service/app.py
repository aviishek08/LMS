from flask import Flask, jsonify
import pandas as pd
from models.content_based import *
from models.collaborative import *

app = Flask(__name__)

books_df = pd.read_csv("data/books.csv")
borrow_df = pd.read_csv("data/user_borrow.csv")

tfidf, cosine_sim = build_content_model(books_df)
user_item_matrix = build_user_item_matrix(borrow_df)
knn_model = build_knn_model(user_item_matrix)

@app.route("/recommendations/<user_id>/<book_title>", methods=["GET"])
def hybrid_recommendations(user_id, book_title):
    content_recs = get_content_recommendations(book_title, books_df, tfidf_matrix=tfidf, cosine_sim=cosine_sim)
    collab_recs = get_collab_recommendations(user_id, user_item_matrix, knn_model, books_df)
    combined = {book["title"]: book for book in content_recs + collab_recs}
    return jsonify(list(combined.values()))

if __name__ == "__main__":
    app.run(port=5000, debug=True)
