from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import User, FriendRequest
from app.notifications.notify import notify  # ✅ Optional: keep for in-app notifications

friends_bp = Blueprint('friends', __name__, url_prefix='/friends')

# ---------------------------
# Send Friend Request
# ---------------------------
@friends_bp.route('/send/<int:user_id>', methods=['POST'])
@login_required
def send_request(user_id):
    target_user = User.query.get_or_404(user_id)

    if target_user.id == current_user.id:
        return jsonify({"message": "You can't send a friend request to yourself."}), 400

    # Already friends
    if current_user.friends.filter_by(id=target_user.id).first():
        return jsonify({"message": "Already friends."}), 400

    # Already sent
    if FriendRequest.query.filter_by(sender_id=current_user.id, receiver_id=target_user.id, status='pending').first():
        return jsonify({"message": "Friend request already sent."}), 400

    # Create request
    req = FriendRequest(sender_id=current_user.id, receiver_id=target_user.id)
    db.session.add(req)
    db.session.commit()

    # Optional: notify
    notify(
        target_user,
        f"{current_user.full_name} sent you a friend request.",
        "/friends/requests"
    )

    return jsonify({"message": "Friend request sent successfully.", "status": "requested"}), 200


# ---------------------------
# Get All Pending Requests (received)
# ---------------------------
@friends_bp.route('/requests', methods=['GET'])
@login_required
def get_requests():
    pending = FriendRequest.query.filter_by(receiver_id=current_user.id, status='pending').all()
    requests_data = [
        {
            "id": req.id,
            "sender_id": req.sender.id,
            "sender_name": req.sender.full_name,
            "sender_profile": req.sender.profile_image if hasattr(req.sender, 'profile_image') else None,
            "status": req.status
        }
        for req in pending
    ]
    return jsonify(requests_data), 200


# ---------------------------
# Accept Friend Request
# ---------------------------
@friends_bp.route('/accept/<int:req_id>', methods=['POST'])
@login_required
def accept_request(req_id):
    req = FriendRequest.query.get_or_404(req_id)

    if req.receiver_id != current_user.id:
        return jsonify({"message": "Unauthorized."}), 403

    req.status = 'accepted'
    current_user.friends.append(req.sender)
    req.sender.friends.append(current_user)
    db.session.commit()

    notify(
        req.sender,
        f"{current_user.full_name} accepted your friend request.",
        "/friends/list"
    )

    return jsonify({"message": "Friend request accepted.", "status": "accepted"}), 200


# ---------------------------
# Reject Friend Request
# ---------------------------
@friends_bp.route('/reject/<int:req_id>', methods=['POST'])
@login_required
def reject_request(req_id):
    req = FriendRequest.query.get_or_404(req_id)

    if req.receiver_id != current_user.id:
        return jsonify({"message": "Unauthorized."}), 403

    req.status = 'rejected'
    db.session.commit()

    return jsonify({"message": "Friend request rejected.", "status": "rejected"}), 200


# ---------------------------
# Remove a Friend
# ---------------------------
@friends_bp.route('/remove/<int:user_id>', methods=['POST'])
@login_required
def remove_friend(user_id):
    friend = User.query.get_or_404(user_id)

    if friend not in current_user.friends:
        return jsonify({"message": "Not in your friends list."}), 400

    current_user.friends.remove(friend)
    friend.friends.remove(current_user)
    db.session.commit()

    return jsonify({"message": "Friend removed successfully.", "status": "removed"}), 200


# ---------------------------
# Get Friend List
# ---------------------------
@friends_bp.route('/list', methods=['GET'])
@login_required
def list_friends():
    friends = current_user.friends.all()
    friends_data = [
        {
            "id": f.id,
            "name": f.full_name,
            "email": f.email,
            "profile_image": getattr(f, "profile_pic", None)
        }
        for f in friends
    ]
    return jsonify(friends_data), 200


# ---------------------------
# Search Friends (by skill or name)
# ---------------------------
@friends_bp.route('/search', methods=['GET'])
@login_required
def search_friends():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([]), 200

    results = User.query.filter(
        User.id != current_user.id,
        (User.full_name.ilike(f'%{query}%')) | (User.skills.ilike(f'%{query}%'))
    ).all()

    users = [
        {
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "skills": u.skills,
            "profile_image": getattr(u, "profile_image", None)
        }
        for u in results
    ]

    return jsonify(users), 200