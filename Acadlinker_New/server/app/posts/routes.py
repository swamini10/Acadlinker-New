import os
import secrets
from flask import Blueprint, jsonify, request, current_app, url_for
from flask_login import login_required, current_user
from app import db
from app.models import Post, User
import cloudinary.uploader

# --- BLUEPRINT ---
# The /api prefix is now part of the blueprint for all post routes
posts_bp = Blueprint('posts', __name__)


def serialize_post(post):
    """Converts a Post object into a serializable dictionary."""

    image_url = None

    # If Cloudinary stored URL → file_name IS the full URL
    if post.file_name and post.file_name.startswith("http"):
        image_url = post.file_name

    # If local file → build static path
    elif post.file_name:
        image_url = url_for(
            "static",
            filename=f"uploads/{post.file_name}",
            _external=False
        )

    return {
        "id": post.id,
        "title": post.title,
        "description": post.description,
        "file_url": image_url,
        "date_posted": post.timestamp.isoformat(),
        "user": {
            "id": post.user.id,
            "name": post.user.full_name,
            "profile_pic": getattr(post.user, "profile_pic", None)
        }
    }





def save_post_file(file):
    """
    Uploads file to Cloudinary if enabled,
    otherwise saves locally in /static/uploads.
    """

    # If CLOUDINARY mode ON → upload there
    if current_app.config.get("UPLOAD_PROVIDER") == "cloudinary":
        upload_result = cloudinary.uploader.upload(
            file,
            folder="acadlinker/posts"
        )
        return upload_result["secure_url"]   # return Cloudinary URL

    # Otherwise → LOCAL STORAGE fallback
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(file.filename)
    filename = random_hex + f_ext

    upload_folder = os.path.join(current_app.root_path, "static/uploads")
    os.makedirs(upload_folder, exist_ok=True)

    path = os.path.join(upload_folder, filename)
    file.save(path)

    return filename   # return filename only



# --- API ROUTE: CREATE POST ---
@posts_bp.route('/create', methods=['POST'])
@login_required
def create_post():
    """
    Creates a new post. React sends this as 'multipart/form-data'.
    """
    # 1. Get text data from request.form
    title = request.form.get('title')
    description = request.form.get('description')

    if not title:
        return jsonify({"error": "Title is required"}), 400

    # 2. Get file data from request.files
    file_name = None
    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']
        
        # Simple validation for images
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
             return jsonify({"error": "File must be an image (png, jpg, jpeg)"}), 400
        
        file_name = save_post_file(file)

    # 3. Create and save the post
    post = Post(
        user_id=current_user.id,
        title=title,
        description=description,
        file_name=file_name
        # Assumes 'author' backref is set on your User model
        # e.g., posts = db.relationship('Post', backref='author', lazy=True)
    )
    db.session.add(post)
    db.session.commit()

    # Return the new post as JSON
    return jsonify({
        "message": "Post created!",
        "post": serialize_post(post) # Send the new post back
    }), 201 # 201 = Created


# --- API ROUTE: GET MY POSTS ---
@posts_bp.route('/my', methods=['GET'])
@login_required
def user_posts():
    """
    Returns a list of all posts made by the current user.
    """
    posts = Post.query.filter_by(user_id=current_user.id).order_by(Post.timestamp.desc()).all()
    
    # Serialize the list of posts
    serialized_posts = [serialize_post(post) for post in posts]
    
    return jsonify(serialized_posts), 200


# --- API ROUTE: GET HOME FEED ---
@posts_bp.route('/home', methods=['GET'])
@login_required
def home_feed():
    """
    Returns a list of posts from the user's friends.
    """
    # Assumes current_user.friends is a list of User objects
    friend_ids = [f.id for f in current_user.friends]
    
    # Add user's own ID to the list to see their own posts in the feed
    friend_ids.append(current_user.id) 

    posts = Post.query.filter(
        Post.user_id.in_(friend_ids)
    ).order_by(Post.timestamp.desc()).all()
    
    serialized_posts = [serialize_post(post) for post in posts]
    print(serialized_posts)
    
    return jsonify(serialized_posts), 200