from flask import Blueprint, request, jsonify
from . import mysql

horarios_bp = Blueprint('horarios', __name__)

# Obtener todos los horarios
@horarios_bp.route('/', methods=['GET'])
def obtener_horarios():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM Horarios")
    horarios = cursor.fetchall()
    cursor.close()

    # Convierte las tuplas en una lista de diccionarios
    horarios_list = []
    for horario in horarios:
        horarios_list.append({
            'id_horario': horario[0],
            'dia': horario[1],
            'hora_inicio': str(horario[2]),  # Convertir a cadena
            'hora_fin': str(horario[3])  # Convertir a cadena
        })

    return jsonify(horarios_list)

# Registrar un horario
@horarios_bp.route('/', methods=['POST'])
def registrar_horario():
    datos = request.json
    dia = datos.get('dia')
    hora_inicio = datos.get('hora_inicio')
    hora_fin = datos.get('hora_fin')

    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO Horarios (dia, hora_inicio, hora_fin) VALUES (%s, %s, %s)",
        (dia, hora_inicio, hora_fin)
    )
    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Horario registrado exitosamente'})
