from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import User
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

suggestions_bp = Blueprint('suggestions', __name__)


def generate_suggestions(current_user, all_users, k=5):
    """Generate suggested friends using skills + location similarity"""

    if not all_users:
        return []

    data = pd.DataFrame([{
        'id': u.id,
        'skills': u.skills or '',
        'location': u.location or ''
    } for u in all_users])

    data['combined'] = data['skills'] + ' ' + data['location']

    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform(data['combined'])
    similarity_matrix = cosine_similarity(vectors)

    try:
        current_index = data.index[data['id'] == current_user.id][0]
    except IndexError:
        return []

    similarity_scores = list(enumerate(similarity_matrix[current_index]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    top_users = [
        int(data.iloc[i[0]]['id'])
        for i in similarity_scores
        if data.iloc[i[0]]['id'] != current_user.id and i[1] >= 0.40
    ][:k]

    return top_users


# -----------------------------
# ONLY API ROUTE (for React)
# -----------------------------
@suggestions_bp.route('/', methods=['GET'])
@login_required
def suggestions_api():
    """Return suggestions as JSON for React frontend"""

    all_users = User.query.all()
    similar_user_ids = generate_suggestions(current_user, all_users)

    suggested_users = User.query.filter(User.id.in_(similar_user_ids)).all()

    # Convert to JSON
    response = [
        {
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "skills": u.skills,
            "location": u.location,
            "profile_image": getattr(u, "profile_pic", None)
        }
        for u in suggested_users
    ]
    print(response)
    return jsonify({
        "status": "success",
        "count": len(response),
        "data": response
    }), 200
