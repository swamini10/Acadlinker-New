# app/auth/routes.py (REST API VERSION)
from flask import Blueprint, jsonify, request
from app import db, bcrypt
from app.models import User
from flask_login import login_user, logout_user, login_required, current_user

# 🚨 We no longer need to import forms, render_template, redirect, or flash.

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# --- Helper Function for Serialization (REQUIRED for JSON response) ---
# NOTE: In a real app, you would use Marshmallow for full model serialization.
# This simple function is just for the login response.
def serialize_user(user):
    return {
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'profile_pic': user.profile_pic,
        'location': user.location
        # Do NOT return the password hash!
    }


@auth_bp.route('/register', methods=['POST'])
def register():
    print("Hello")

    # 1. Check if authenticated
    if current_user.is_authenticated:
        return jsonify({'message': 'Already logged in.'}), 400

    # 2. Get data from JSON payload
    data = request.get_json()
    print("REGISTER PAYLOAD:", data)
    if not data:
        return jsonify({'message': 'Missing JSON data in request.'}), 400

    # 3. Basic Data Validation
    required_fields = ['full_name', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields.'}), 400

    # 4. Check for existing user
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered.'}), 409  # 409 Conflict

    # 5. Create and commit new user
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        full_name=data['full_name'],
        email=data['email'],
        mobile_no=data.get('mobile_no'),
        password=hashed_pw
    )
    db.session.add(new_user)
    db.session.commit()

    # 6. Return success response
    return jsonify({
        'message': 'Registration successful. Please log in.',
        'user_id': new_user.id
    }), 201  # 201 Created


@auth_bp.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({'message': 'Already logged in.', 'user': serialize_user(current_user)}), 200

    # 1. Get data from JSON payload
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing email or password.'}), 400

    # 2. Authenticate user
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        return jsonify({
            'message': 'Login successful.',
            'user': serialize_user(user) # Return user data for frontend session
        }), 200 # 200 OK
    else:
        # Return generic error for security
        return jsonify({'message': 'Invalid credentials.'}), 401 # 401 Unauthorized

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    # 200 OK, no content needed, or a simple message
    return jsonify({'message': 'Successfully logged out.'}), 200

@auth_bp.route('/status', methods=['GET'])
def status():
    # Endpoint for the frontend to check if a user is currently logged in
    if current_user.is_authenticated:
        return jsonify({
            'is_logged_in': True,
            'user': serialize_user(current_user)
        }), 200
    else:
        return jsonify({'is_logged_in': False}), 401 # 401 Unauthorized