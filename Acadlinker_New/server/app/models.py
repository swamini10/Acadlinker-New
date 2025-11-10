from datetime import datetime
from app import db, login_manager
from flask_login import UserMixin

# Association Table (many-to-many for accepted friendships)
friendships = db.Table('friendships',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('friend_id', db.Integer, db.ForeignKey('user.id'))
)

class FriendRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.String(10), default='pending')  # 'pending', 'accepted', 'rejected'

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    content = db.Column(db.Text)
    file_name = db.Column(db.String(120))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    members = db.relationship('User', secondary='group_members', backref='groups')

class GroupInvite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.String(10), default='pending')  # pending / accepted / rejected

# Association table for group members
group_members = db.Table('group_members',
    db.Column('group_id', db.Integer, db.ForeignKey('group.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(120))
    description = db.Column(db.Text)
    file_name = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('posts', lazy='dynamic'))

from app import db
from datetime import datetime

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    link = db.Column(db.String(255))
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic'))




@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    mobile_no = db.Column(db.String(15))
    profile_pic = db.Column(db.String(500), default='default.jpg')
    cover_photo = db.Column(db.String(500), default='cover.jpg')
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    skills = db.Column(db.String(255))
    education = db.Column(db.Text)

    sent_requests = db.relationship(
        'FriendRequest',
        foreign_keys='FriendRequest.sender_id',
        backref='sender',
        lazy='dynamic'
    )

    received_requests = db.relationship(
        'FriendRequest',
        foreign_keys='FriendRequest.receiver_id',
        backref='receiver',
        lazy='dynamic'
    )

    friends = db.relationship(
        'User',
        secondary=friendships,
        primaryjoin=(friendships.c.user_id == id),
        secondaryjoin=(friendships.c.friend_id == id),
        backref=db.backref('friend_of', lazy='dynamic'),
        lazy='dynamic'
    )


    def __repr__(self):
        return f"User('{self.full_name}', '{self.email}')"