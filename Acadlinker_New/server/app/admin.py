# your_app/admin.py

from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from app.models import User,Post,FriendRequest

def init_admin(app, db):
    admin = Admin(app, name='My Admin', template_mode='bootstrap3')
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Post, db.session))
    admin.add_view(ModelView(FriendRequest, db.session))