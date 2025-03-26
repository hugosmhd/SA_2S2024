from flask import Blueprint, request, jsonify
from models import db, User, Producto, Carrito, DetallesCarrito, Venta, DetallesVenta, TarjetaPago, ProductoExterno
from utils import hash_password, verify_password, create_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from flask import current_app
import smtplib
from email.mime.text import MIMEText
import boto3
import os
import json
import requests

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
    

@auth_bp.route("/productos-externos", methods=["GET"])
def get_productos_externos():
    try:
        # Consulta todos los productos externos
        productos = ProductoExterno.query.all()
        
        # Estructura los datos en el formato requerido
        productos_data = [
            {
                "sku": producto.sku,
                "img": producto.imagen_producto,
                "nombre": producto.nombre_producto,
                "precio": float(producto.precio),
                "stock": producto.stock,
                "categoria": producto.categoria
            }
            for producto in productos
        ]
        
        # Devuelve el JSON con el número del grupo y los productos
        response = {
            "numgrupo": 14,  # Cambia al número del grupo correspondiente
            "productos": productos_data
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/productos-externos/consumir", methods=["POST"])
def consumir_api_productos():
    try:
        # Depurar datos recibidos
        data = request.json
        print("Datos recibidos:", data)

        api_url = data.get("api_url")

        if not api_url:
            return jsonify({"error": "Se requiere 'api_url' en el cuerpo de la solicitud"}), 400

        # Consumir la API externa
        response = requests.get(api_url)
        print("Respuesta de la API externa:", response.status_code, response.text)

        if response.status_code not in [200, 201]:  # Manejar códigos 200 y 201
            return jsonify({"error": f"Error al consumir la API externa: {response.status_code}"}), 500

        productos_externos = response.json().get("body", [])
        print("Productos obtenidos de la API externa:", productos_externos)

        if not productos_externos:
            return jsonify({"error": "No se encontraron productos en la API externa"}), 400

        # Insertar o actualizar los productos en ProductoExterno y Productos
        for producto in productos_externos:
            print("Procesando producto:", producto)
            try:
                # Procesar en ProductoExterno
                producto_existente_externo = ProductoExterno.query.filter_by(sku=producto.get("SKU")).first()

                if producto_existente_externo:
                    # Actualizar producto existente en ProductoExterno
                    producto_existente_externo.precio = float(producto.get("Precio", producto_existente_externo.precio))
                    producto_existente_externo.stock += int(producto.get("Stock", 0))
                    producto_existente_externo.imagen_producto = producto.get("Imagen", producto_existente_externo.imagen_producto)
                    producto_existente_externo.etiqueta = producto.get("Etiqueta", producto_existente_externo.etiqueta)
                    producto_existente_externo.num_grupo = int(producto.get("NumeroGrupo", producto_existente_externo.num_grupo))
                    print(f"Producto actualizado en ProductoExterno: {producto.get('SKU')}")
                else:
                    # Insertar nuevo producto en ProductoExterno
                    nuevo_producto_externo = ProductoExterno(
                        id_proveedor=1,
                        categoria=producto.get("Categoria", "Sin categoría"),
                        sku=producto.get("SKU"),
                        nombre_producto=producto.get("Nombre"),
                        precio=float(producto.get("Precio", 0)),
                        stock=int(producto.get("Stock", 0)),
                        imagen_producto=producto.get("Imagen"),
                        etiqueta=producto.get("Etiqueta", "Proveedor Externo"),
                        num_grupo=int(producto.get("NumeroGrupo", 0))
                    )
                    db.session.add(nuevo_producto_externo)
                    print(f"Producto insertado en ProductoExterno: {producto.get('SKU')}")

                # Procesar en Productos
                producto_existente = Producto.query.filter_by(nombre_producto=producto.get("Nombre")).first()

                if producto_existente:
                    # Actualizar producto existente en Productos
                    producto_existente.precio = float(producto.get("Precio", producto_existente.precio))
                    producto_existente.stock += int(producto.get("Stock", 0))
                    producto_existente.imagen_producto = producto.get("Imagen", producto_existente.imagen_producto)
                    print(f"Producto actualizado en Productos: {producto.get('Nombre')}")
                else:
                    # Insertar nuevo producto en Productos
                    nuevo_producto = Producto(
                        id_proveedor=1,  # Valor predeterminado
                        id_categoria=1,  # Valor predeterminado
                        nombre_producto=producto.get("Nombre"),
                        precio=float(producto.get("Precio", 0)),
                        stock=int(producto.get("Stock", 0)),
                        imagen_producto=producto.get("Imagen")
                    )
                    db.session.add(nuevo_producto)
                    print(f"Producto insertado en Productos: {producto.get('Nombre')}")

            except Exception as e:
                print("Error al procesar producto:", producto, str(e))
                db.session.rollback()  # Revertir cambios si hay un error
                return jsonify({"error": f"Error al procesar producto {producto.get('SKU', 'sin SKU')}: {str(e)}"}), 500

        # Guardar los cambios en la base de datos
        db.session.commit()
        print("Todos los productos se procesaron correctamente")

        return jsonify({"message": "Productos externos procesados correctamente y actualizados en ambas tablas"}), 201

    except Exception as e:
        print("Error en el backend:", str(e))  # Depuración detallada
        return jsonify({"error": str(e)}), 500





@auth_bp.route("/users", methods=["GET"])
def get_all_users():
    # Obtener todos los usuarios
    users = User.query.all()
    users_data = [
        {
            "id": user.id_usuario,
            "tipo_usuario": user.tipo_usuario,
            "nombre_empresa": user.nombre_empresa,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "email": user.email,
            "direccion": user.direccion,
            "celular": user.celular,
            "fotografia": user.fotografia,
        }
        for user in users
    ]
    return jsonify({"users": users_data}), 200

@auth_bp.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Actualizar registros relacionados para desvincularlos del usuario
        carritos = Carrito.query.filter_by(id_cliente=user_id).all()
        for carrito in carritos:
            carrito.id_cliente = None  # Cambiar a NULL u otro valor predeterminado

        db.session.commit()  # Guardar los cambios en los registros relacionados

        # Eliminar al usuario
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "Usuario eliminado exitosamente"}), 200

    except Exception as e:
        print(f"Error al eliminar usuario: {e}")
        return jsonify({"error": "Ocurrió un error al intentar eliminar el usuario"}), 500



@auth_bp.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    # Buscar al usuario en la base de datos
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.json

    # Actualizar datos del usuario
    user.tipo_usuario = data.get("tipo_usuario", user.tipo_usuario)
    user.nombre_empresa = data.get("nombre_empresa", user.nombre_empresa)
    user.nombres = data.get("nombres", user.nombres)
    user.apellidos = data.get("apellidos", user.apellidos)
    user.email = data.get("email", user.email)
    user.direccion = data.get("direccion", user.direccion)
    user.celular = data.get("celular", user.celular)

    try:
        db.session.commit()
        return jsonify({"message": "Usuario actualizado exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/jwtready", methods=["GET"])
@jwt_required()
def dashboard():
    current_user = json.loads(get_jwt_identity())
    return jsonify({"message": "Access granted", "user": current_user}), 200

