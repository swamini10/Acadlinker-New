from flask import Blueprint, jsonify

# Note: We are NOT giving this a url_prefix so it serves the root path '/'
main_bp = Blueprint('main', __name__)

@main_bp.route('/', methods=['GET'])
def index():
    """
    The main route. In a production environment, this would serve the 
    index.html file that loads the React/Vite frontend bundle.
    For this API-focused canvas, we return a simple status message.
    """
    return jsonify({
        "message": "Acadlinker API is running.",
        "api_endpoints": "/api/auth/*, /api/profile/*"
    }), 200
