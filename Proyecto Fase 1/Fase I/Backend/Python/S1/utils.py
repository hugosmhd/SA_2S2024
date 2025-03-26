from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta
import json

def hash_password(password):
    return generate_password_hash(password)

def verify_password(password, hashed_password):
    return check_password_hash(hashed_password, password)

def create_token(identity):
    return create_access_token(identity=json.dumps(identity), expires_delta=timedelta(hours=2))
