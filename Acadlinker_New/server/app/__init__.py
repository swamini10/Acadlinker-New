from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from config import Config
import cloudinary
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    
    CORS(
        app,
        origins=[app.config["FRONTEND_URL"]],
        supports_credentials=True
    )

    # Initialize extensions with the application instance
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    login_manager.init_app(app)

     # Initialize Cloudinary (only if using cloud provider)
    if app.config['UPLOAD_PROVIDER'] == 'cloudinary':
        cloudinary.config(
            cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
            api_key=app.config['CLOUDINARY_API_KEY'],
            api_secret=app.config['CLOUDINARY_API_SECRET']
        )
    
    # =================================================================
    # Register API Blueprints (Only implemented blueprints kept)
    # =================================================================

    # Main Blueprint: Handles the root path (/)
    # It has NO url_prefix, so it catches requests to '/'
    from app.main.routes import main_bp
    app.register_blueprint(main_bp) 

    # Authentication API (e.g., /api/auth/register, /api/auth/login)
    from app.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # Profile API (e.g., /api/profile/123, /api/profile/edit)
    from app.profile.routes import profile_bp
    app.register_blueprint(profile_bp, url_prefix='/api/profile')

    from app.friends.routes import friends_bp
    app.register_blueprint(friends_bp, url_prefix='/api/friends')

    from app.notifications.routes import notifications_bp
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    from app.search.routes import search_bp
    app.register_blueprint(search_bp)

    from app.suggestions.routes import suggestions_bp
    app.register_blueprint(suggestions_bp, url_prefix='/api/suggestions')

    from app.posts.routes import posts_bp
    app.register_blueprint(posts_bp, url_prefix='/api/posts')

    # =================================================================
    # Register Backend Admin Interface
    # =================================================================
    from app.admin import init_admin
    init_admin(app, db) 

    return app