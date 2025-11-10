from app import db
from app.models import Notification

def notify(user, message, link="/"):
    """
    Create a new notification for a user.
    'link' should be a frontend route (like /friends/list or /messages).
    """
    notif = Notification(
        user_id=user.id,
        message=message,
        link=link,
        is_read=False
    )
    db.session.add(notif)
    db.session.commit()
