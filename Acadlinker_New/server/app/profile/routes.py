# app/profile/routes.py
import os
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from app import db
from app.models import User, Post
import cloudinary.uploader

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')


def serialize_user(user, include_posts=False):
    user_data = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "mobile_no": user.mobile_no,
        "location": user.location,
        "description": user.description,
        "skills": user.skills,
        "education": user.education,
        "profile_pic_url": user.profile_pic,
        "cover_photo_url": user.cover_photo,
        "created_at": user.created_at.isoformat(),
    }

    if include_posts:
        user_data["posts"] = [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "file_name": p.file_name,
                "timestamp": p.timestamp.isoformat(),
            }
            for p in Post.query.filter_by(user_id=user.id)
            .order_by(Post.timestamp.desc())
            .all()
        ]

    return user_data


def save_file(file_storage):
    if file_storage:
        upload_result = cloudinary.uploader.upload(
            file_storage,
            folder="profile_pics",
            resource_type="image"
        )
        return upload_result.get("secure_url")
    return None


@profile_bp.route("/<int:user_id>", methods=["GET"])
@login_required
def get_profile(user_id):
    print("Requested user_id:", user_id)
    print("Current user_id:", current_user.id)
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # ✅ FIX 1: safer friend check (avoids lazy-loading bugs)
    is_friend = db.session.query(User).filter(
        User.id == current_user.id,
        User.friends.any(id=user.id)
    ).first() is not None

    # ✅ FIX 2: decide what to show
    include_posts = current_user.id == user.id or is_friend

    # ✅ FIX 3: don’t leak private info if not friends
    user_data = serialize_user(user, include_posts)
    if current_user.id != user.id and not is_friend:
        # remove email/mobile for privacy
        user_data.pop("email", None)
        user_data.pop("mobile_no", None)

    return jsonify(user_data), 200


@profile_bp.route("/<int:user_id>/posts", methods=["GET"])
@login_required
def get_user_posts(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    posts = (
        Post.query.filter_by(user_id=user.id)
        .order_by(Post.timestamp.desc())
        .all()
    )

    posts_data = [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "file_name": p.file_name,
            "timestamp": p.timestamp.isoformat(),
        }
        for p in posts
    ]
    return jsonify(posts_data), 200


@profile_bp.route("/edit", methods=["PUT", "PATCH"])
@login_required
def edit_profile():
    data = request.form

    current_user.full_name = data.get("full_name", current_user.full_name)
    current_user.email = data.get("email", current_user.email)
    current_user.mobile_no = data.get("mobile_no", current_user.mobile_no)
    current_user.location = data.get("location", current_user.location)
    current_user.description = data.get("description", current_user.description)
    current_user.skills = data.get("skills", current_user.skills)
    current_user.education = data.get("education", current_user.education)

    # ✅ Handle file uploads with Cloudinary
    profile_pic_file = request.files.get("profile_pic")
    cover_photo_file = request.files.get("cover_photo")

    if profile_pic_file and isinstance(profile_pic_file, FileStorage) and profile_pic_file.filename:
        uploaded_url = save_file(profile_pic_file)
        if uploaded_url:
            current_user.profile_pic = uploaded_url

    if cover_photo_file and isinstance(cover_photo_file, FileStorage) and cover_photo_file.filename:
        uploaded_url = save_file(cover_photo_file)
        if uploaded_url:
            current_user.cover_photo = uploaded_url

    try:
        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully",
            "user": serialize_user(current_user)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Update failed: {str(e)}"}), 500
