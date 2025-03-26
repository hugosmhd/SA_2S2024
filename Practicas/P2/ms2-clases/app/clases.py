from flask import Blueprint, request, jsonify
from . import mysql

clases_bp = Blueprint('clases', __name__)

# Obtener todas las clases
@clases_bp.route('/', methods=['GET'])
def obtener_clases():
    cursor = mysql.connection.cursor()  # Sin dictionary=True
    cursor.execute("SELECT * FROM Clases")
    clases = cursor.fetchall()  # Obtiene los datos como tuplas
    cursor.close()

    # Convierte las tuplas en una lista de diccionarios
    clases_list = []
    for clase in clases:
        clases_list.append({
            'id_clase': clase[0],
            'nombre_clase': clase[1],
            'descripcion': clase[2],
            'capacidad': clase[3],
            'id_horario': clase[4]
        })

    return jsonify(clases_list)

# Crear una nueva clase
@clases_bp.route('/', methods=['POST'])
def registrar_clase():
    datos = request.json
    nombre_clase = datos.get('nombre_clase')
    descripcion = datos.get('descripcion')
    capacidad = datos.get('capacidad')
    id_horario = datos.get('id_horario')

    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO Clases (nombre_clase, descripcion, capacidad, id_horario) VALUES (%s, %s, %s, %s)",
        (nombre_clase, descripcion, capacidad, id_horario)
    )
    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Clase registrada exitosamente'}), 201

# Registrar una reserva
@clases_bp.route('/reservas', methods=['POST'])
def registrar_reserva():
    datos = request.json
    id_usuario = datos.get('id_usuario')
    id_clase = datos.get('id_clase')

    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO Reservas (id_usuario, id_clase) VALUES (%s, %s)",
        (id_usuario, id_clase)
    )
    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Reserva registrada exitosamente'})
