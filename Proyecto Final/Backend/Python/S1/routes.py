from flask import Blueprint, request, jsonify
from models import db, User, Producto, Carrito, DetallesCarrito, Venta, DetallesVenta, TarjetaPago
from utils import hash_password, verify_password, create_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from flask import current_app
import smtplib
from email.mime.text import MIMEText
import boto3
import os
import json

auth_bp = Blueprint("auth", __name__)


# Función para subir archivos a S3
def upload_file_to_s3(file, bucket_name, acl="public-read"):
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_DEFAULT_REGION')
    )

    # Hacer seguro el nombre del archivo
    filename = secure_filename(file.filename)

    try:
        s3.upload_fileobj(
            file,
            bucket_name,
            filename,
            ExtraArgs={
                "ACL": acl,
                "ContentType": file.content_type
            }
        )
        # Retornar la URL pública del archivo
        return f"https://{bucket_name}.s3.amazonaws.com/{filename}"

    except Exception as e:
        print("Error al subir el archivo:", e)
        return None

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    try:
        user = User(
            tipo_usuario=data["tipo_usuario"],
            nombre_empresa=data.get("nombre_empresa"),
            nombres=data.get("nombres"),
            apellidos=data.get("apellidos"),
            email=data["email"],
            contrasena=hash_password(data["contrasena"]),
            direccion=data.get("direccion"),
            celular=data.get("celular"),
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "Usuario registrado exitosamente"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if user and verify_password(data["contrasena"], user.contrasena):
        token = create_token(identity={"id": user.id_usuario, "tipo": user.tipo_usuario})
        return jsonify({"access_token": token}), 200
    return jsonify({"error": "Credenciales inválidas"}), 401

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    # Obtener el ID del usuario actual desde el token JWT
    current_user = json.loads(get_jwt_identity())

    # Buscar el usuario en la base de datos
    user = User.query.get(current_user["id"])
    
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Crear una respuesta con la información del usuario, incluyendo la fotografía si existe
    user_data = {
        "id": user.id_usuario,
        "tipo_usuario": user.tipo_usuario,
        "nombre_empresa": user.nombre_empresa,
        "nombres": user.nombres,
        "apellidos": user.apellidos,
        "email": user.email,
        "direccion": user.direccion,
        "celular": user.celular,
        "fotografia": user.fotografia  # Incluye la URL de la fotografía
    }
    
    return jsonify({"user": user_data}), 200

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_user_profile():
    # Obtener el ID del usuario actual desde el token JWT
    current_user = json.loads(get_jwt_identity())
    
    # Buscar al usuario en la base de datos
    user = User.query.get(current_user["id"])
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Obtener datos del request
    data = request.form.to_dict()  # Obtener campos enviados como texto
    file = request.files.get('fotografia')  # Obtener archivo si se envió

    # Actualizar los datos del usuario
    user.nombres = data.get("nombres", user.nombres)
    user.apellidos = data.get("apellidos", user.apellidos)
    user.email = data.get("email", user.email)
    user.direccion = data.get("direccion", user.direccion)
    user.celular = data.get("celular", user.celular)

    # Si se envió una nueva fotografía, subirla a S3
    if file:
        bucket_name = "ayd2proyecto2"
        foto_url = upload_file_to_s3(file, bucket_name)
        if foto_url:
            user.fotografia = foto_url
        else:
            return jsonify({"error": "Error al subir la fotografía"}), 500

    # Guardar cambios en la base de datos
    try:
        db.session.commit()
        return jsonify({"message": "Perfil actualizado exitosamente", "user": {
            "id": user.id_usuario,
            "tipo_usuario": user.tipo_usuario,
            "nombre_empresa": user.nombre_empresa,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "email": user.email,
            "direccion": user.direccion,
            "celular": user.celular,
            "fotografia": user.fotografia
        }}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/jwtready", methods=["GET"])
@jwt_required()
def dashboard():
    current_user = json.loads(get_jwt_identity())
    return jsonify({"message": "Access granted", "user": current_user}), 200

