import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secure_key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # For development over HTTP
    SESSION_COOKIE_SAMESITE = "Lax"  # easier for dev
    SESSION_COOKIE_SECURE = False    # must be False for HTTP
    REMEMBER_COOKIE_SAMESITE = "Lax"
    REMEMBER_COOKIE_SECURE = False

    FRONTEND_URL = os.getenv("FRONTEND_URL", "*")   # for CORS

    # Cloudinary credentials
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    UPLOAD_PROVIDER = os.getenv("UPLOAD_PROVIDER", "local")  # local or cloudinary