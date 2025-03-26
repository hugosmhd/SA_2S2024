from flask import Flask
from flask_mysqldb import MySQL
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

mysql = MySQL()
def create_app():
    app = Flask(__name__)

    # Configuración de la base de datos
    app.config['MYSQL_HOST'] = os.getenv('DB_HOST')
    app.config['MYSQL_USER'] = os.getenv('DB_USER')
    app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD')
    app.config['MYSQL_DB'] = os.getenv('DB_NAME')  # Cambiar MYSQL_DATABASE por MYSQL_DB

    mysql.init_app(app)

    # Registro de Blueprints
    from .pagos import pagos_bp

    app.register_blueprint(pagos_bp, url_prefix='/pagos')


    return app
