from flask import Blueprint, jsonify, request
from sqlalchemy import or_
from app.models import User, db  # Make sure models.py is accessible

# 1. Create a new Blueprint
search_bp = Blueprint('search', __name__, url_prefix='/api')

# 2. Move the search route here
@search_bp.route('/search', methods=['GET'])
def search_users():
    """
    Handles searching for users by name or email.
    The frontend will call this at /api/search?q=...
    """
    
    # Get the search term from the URL (e.g., "s")
    search_term = request.args.get('q')

    if not search_term:
        return jsonify({"error": "Search query not provided"}), 400

    # Build the search query (case-insensitive, partial match)
    search_query = f"%{search_term}%"

    try:
        # Query the database for users where 'full_name' OR 'email' contains the search term
        found_users = User.query.filter(
            or_(
                User.full_name.ilike(search_query),
                User.email.ilike(search_query)
            )
        ).all()

        # Format the results to send to the frontend
        results_list = []
        for user in found_users:
            results_list.append({
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "profile_pic_url": user.profile_pic or "default.jpg", # Use 'profile_pic_url' as the key for the frontend
                "location": user.location
            })

        # Send the list back as JSON
        return jsonify(results_list)

    except Exception as e:
        print(f"Error during search: {e}")
        return jsonify({"error": "An error occurred during search"}), 500