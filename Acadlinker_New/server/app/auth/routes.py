# app/auth/routes.py
from flask import Blueprint, jsonify, request
from app import db, bcrypt, login_manager # <--- Import login_manager here!
from app.models import User
from flask_login import login_user, logout_user, login_required, current_user

# FIX 1: Remove url_prefix (it is already set in app.py)
auth_bp = Blueprint('auth', __name__) 

# FIX 2: ADD THIS FUNCTION (Essential for staying logged in)
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- Helper Function ---
def serialize_user(user):
    return {
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'profile_pic': getattr(user, 'profile_pic', None), # Safety check
        'location': getattr(user, 'location', None)
    }

@auth_bp.route('/register', methods=['POST'])
def register():
    # ... (Your existing code is fine here) ...
    if current_user.is_authenticated:
        return jsonify({'message': 'Already logged in.'}), 400

    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing JSON data in request.'}), 400

    required_fields = ['full_name', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields.'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered.'}), 409

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        full_name=data['full_name'],
        email=data['email'],
        mobile_no=data.get('mobile_no'),
        password=hashed_pw
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Registration successful. Please log in.',
        'user_id': new_user.id
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({'message': 'Already logged in.', 'user': serialize_user(current_user)}), 200

    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing email or password.'}), 400

    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        # OPTIONAL: Add remember=True to keep user logged in after browser close
        login_user(user, remember=True) 
        
        return jsonify({
            'message': 'Login successful.',
            'user': serialize_user(user)
        }), 200
    else:
        return jsonify({'message': 'Invalid credentials.'}), 401


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Successfully logged out.'}), 200

@auth_bp.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({
            'is_logged_in': True,
            'user': serialize_user(current_user)
        }), 200
    else:
        # Note: 401 is technically correct, but some frontends prefer 200 with {is_logged_in: False}
        # to avoid red errors in the console. Either way works.
        return jsonify({'is_logged_in': False}), 401