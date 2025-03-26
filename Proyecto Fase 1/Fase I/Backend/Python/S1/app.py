import os
from flask import Flask, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # Importa Flask-CORS
from config import Config
from models import db
from routes import auth_bp

app = Flask(__name__)
app.config.from_object(Config)

# Habilitar CORS para todos los orígenes
CORS(app, resources={r"/*": {"origins": "*"}})

db.init_app(app)
jwt = JWTManager(app)

@app.route('/', methods=['GET'])
def get_init():
    response = make_response('hello, world python!', 200)
    return response

app.register_blueprint(auth_bp, url_prefix="/auth")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0", port=3005)
