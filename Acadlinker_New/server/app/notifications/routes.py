from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import Notification

notifications_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

# ---------------------------
# Get All Notifications (JSON)
# ---------------------------
@notifications_bp.route('/', methods=['GET'])
@login_required
def get_notifications():
    """
    Returns all notifications for the logged-in user (latest first)
    and marks unread ones as read.
    """
    notifications = (
        Notification.query.filter_by(user_id=current_user.id)
        .order_by(Notification.timestamp.desc())
        .all()
    )

    # Convert to JSON-friendly dicts
    data = [
        {
            "id": n.id,
            "message": n.message,
            "link": n.link,
            "is_read": n.is_read,
            "timestamp": n.timestamp.isoformat(),
        }
        for n in notifications
    ]

    # Mark all as read after fetching
    for n in notifications:
        if not n.is_read:
            n.is_read = True
    db.session.commit()

    return jsonify(data), 200


# ---------------------------
# Get Unread Notifications Count
# ---------------------------
@notifications_bp.route('/unread_count', methods=['GET'])
@login_required
def get_unread_count():
    """
    Returns how many unread notifications the user currently has.
    Useful for showing a badge on the React navbar.
    """
    count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
    return jsonify({"unread_count": count}), 200


# ---------------------------
# Mark a Notification as Read
# ---------------------------
@notifications_bp.route('/mark_read/<int:notification_id>', methods=['POST'])
@login_required
def mark_as_read(notification_id):
    notif = Notification.query.get_or_404(notification_id)
    if notif.user_id != current_user.id:
        return jsonify({"message": "Unauthorized"}), 403

    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read."}), 200


# ---------------------------
# Delete a Notification
# ---------------------------
@notifications_bp.route('/delete/<int:notification_id>', methods=['DELETE'])
@login_required
def delete_notification(notification_id):
    notif = Notification.query.get_or_404(notification_id)
    if notif.user_id != current_user.id:
        return jsonify({"message": "Unauthorized"}), 403

    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Notification deleted."}), 200

@notifications_bp.route('/send', methods=['POST'])
@login_required
def send_notification():
    data = request.get_json()
    user_id = data.get('user_id')
    message = data.get('message')
    link = data.get('link')
    notif = Notification(user_id=user_id, message=message, link=link)
    db.session.add(notif)
    db.session.commit()
    return jsonify({"message": "Notification sent"}), 201

