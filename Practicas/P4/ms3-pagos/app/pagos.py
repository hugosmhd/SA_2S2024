from flask import Blueprint, request, jsonify
from . import mysql

pagos_bp = Blueprint('pagos', __name__)

# Obtener todos los pagos
@pagos_bp.route('/', methods=['GET'])
def obtener_pagos():
    cursor = mysql.connection.cursor()  # Elimina dictionary=True
    cursor.execute("SELECT * FROM Pagos")
    pagos = cursor.fetchall()  # Obtiene los datos como tuplas
    cursor.close()

    # Convierte las tuplas en una lista de diccionarios
    pagos_list = []
    for pago in pagos:
        pagos_list.append({
            'id_pago': pago[0],
            'id_usuario': pago[1],
            'monto': pago[2],
            'metodo_pago': pago[3],
            'fecha_pago': pago[4]
        })

    return jsonify(pagos_list)

# Registrar un pago
@pagos_bp.route('/', methods=['POST'])
def registrar_pago():
    datos = request.json
    id_usuario = datos.get('id_usuario')
    monto = datos.get('monto')
    metodo_pago = datos.get('metodo_pago')

    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO Pagos (id_usuario, monto, metodo_pago) VALUES (%s, %s, %s)",
        (id_usuario, monto, metodo_pago)
    )
    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Pago registrado exitosamente'}), 201
