# your_app/admin.py

from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from app.models import User,Post,FriendRequest

def init_admin(app, db):
    # NOTE: newer Flask-Admin versions may not accept `template_mode`.
    # If you need a specific template style, pin a compatible Flask-Admin
    # version (e.g. 1.5.8) or customize templates via `base_template`.
    admin = Admin(app, name='My Admin')
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Post, db.session))
    admin.add_view(ModelView(FriendRequest, db.session))