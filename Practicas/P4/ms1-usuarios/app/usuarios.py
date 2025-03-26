from flask import Blueprint, request, jsonify
from . import mysql

usuarios_bp = Blueprint('usuarios', __name__)

# Obtener todos los usuarios
@usuarios_bp.route('/', methods=['GET'])
def obtener_usuarios():
    cursor = mysql.connection.cursor()  # Elimina dictionary=True
    cursor.execute("SELECT * FROM Usuarios")
    usuarios = cursor.fetchall()  # Obtiene los datos como tuplas
    cursor.close()

    # Convierte las tuplas en una lista de diccionarios
    usuarios_list = []
    for usuario in usuarios:
        usuarios_list.append({
            'id_usuario': usuario[0],
            'nombre': usuario[1],
            'email': usuario[2],
            'telefono': usuario[3],
            'fecha_registro': usuario[4]
        })

    return jsonify(usuarios_list)

# Crear un nuevo usuario
@usuarios_bp.route('/', methods=['POST'])
def crear_usuario():
    datos = request.json
    nombre = datos.get('nombre')
    email = datos.get('email')
    contrasena = datos.get('contrasena')
    telefono = datos.get('telefono')

    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO Usuarios (nombre, email, contrasena, telefono) VALUES (%s, %s, %s, %s)",
        (nombre, email, contrasena, telefono)
    )
    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Usuario creado exitosamente'}), 201

# Actualizar un usuario
@usuarios_bp.route('/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    datos = request.json
    nombre = datos.get('nombre')
    email = datos.get('email')
    telefono = datos.get('telefono')

    cursor = mysql.connection.cursor()
    cursor.execute(
        "UPDATE Usuarios SET nombre=%s, email=%s, telefono=%s WHERE id_usuario=%s",
        (nombre, email, telefono, id_usuario)
    )
    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Usuario actualizado exitosamente'})

# Eliminar un usuario
@usuarios_bp.route('/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM Usuarios WHERE id_usuario=%s", (id_usuario,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Usuario eliminado exitosamente'})
