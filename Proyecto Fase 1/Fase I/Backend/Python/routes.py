from flask import Blueprint, request, jsonify
from models import db, User, Producto, Carrito, DetallesCarrito, Venta, DetallesVenta, TarjetaPago
from utils import hash_password, verify_password, create_token
from flask_jwt_extended import decode_token
from werkzeug.utils import secure_filename
from flask import current_app
import smtplib
from email.mime.text import MIMEText
import boto3
import os
import json
import requests

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/cart/add', methods=['POST'])
def add_to_cart():
    current_user = json.loads(get_jwt_identity())
    data = request.json
    try:
        carrito = Carrito.query.filter_by(id_cliente=current_user["id"]).first()
        if not carrito:
            carrito = Carrito(id_cliente=current_user["id"])
            db.session.add(carrito)
            db.session.commit()

        producto = Producto.query.get(data["id_producto"])
        if not producto or producto.stock < data["cantidad"]:
            return jsonify({"error": "Producto no disponible o cantidad insuficiente"}), 400

        detalle_existente = DetallesCarrito.query.filter_by(
            id_carrito=carrito.id_carrito, id_producto=producto.id_producto).first()
        if detalle_existente:
            detalle_existente.cantidad += data["cantidad"]
            detalle_existente.subtotal = producto.precio * detalle_existente.cantidad
        else:
            detalle = DetallesCarrito(
                id_carrito=carrito.id_carrito,
                id_producto=producto.id_producto,
                cantidad=data["cantidad"],
                subtotal=producto.precio * data["cantidad"]
            )
            db.session.add(detalle)

        db.session.commit()
        return jsonify({"message": "Producto añadido al carrito"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/cart", methods=["GET"])
def get_cart():
    current_user = json.loads(get_jwt_identity())
    carrito = Carrito.query.filter_by(id_cliente=current_user["id"]).first()
    if not carrito:
        return jsonify({"message": "Carrito vacío"}), 200

    detalles = DetallesCarrito.query.filter_by(id_carrito=carrito.id_carrito).all()
    response = [
        {
            "id_producto": detalle.id_producto,
            "nombre": Producto.query.get(detalle.id_producto).nombre_producto,
            "cantidad": detalle.cantidad,
            "subtotal": float(detalle.subtotal),
        } for detalle in detalles
    ]
    return jsonify({"carrito": response}), 200

@auth_bp.route("/cart/delete", methods=["POST"])
def delete_from_cart():
    current_user = json.loads(get_jwt_identity())
    data = request.json
    try:
        carrito = Carrito.query.filter_by(id_cliente=current_user["id"]).first()
        if not carrito:
            return jsonify({"error": "Carrito vacío"}), 400

        detalle = DetallesCarrito.query.filter_by(
            id_carrito=carrito.id_carrito, id_producto=data["id_producto"]).first()
        if not detalle:
            return jsonify({"error": "Producto no encontrado en el carrito"}), 400

        db.session.delete(detalle)
        db.session.commit()
        return jsonify({"message": "Producto eliminado del carrito"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/cart/confirm", methods=["POST"])
@jwt_required()
def confirm_purchase():
    try:
        # Obtener el usuario actual
        current_user = json.loads(get_jwt_identity())
        data = request.json

        # Obtener el carrito del usuario
        carrito = Carrito.query.filter_by(id_cliente=current_user["id"]).first()
        if not carrito:
            return jsonify({"error": "No hay productos en el carrito"}), 400

        # Obtener los detalles del carrito
        detalles = DetallesCarrito.query.filter_by(id_carrito=carrito.id_carrito).all()
        if not detalles:
            return jsonify({"error": "El carrito está vacío"}), 400

        # Calcular el total de la compra
        total = sum(float(detalle.subtotal) for detalle in detalles)
        total = total - (total*data["descuento"]/100)

        # Validar método de pago
        if "metodo_pago" not in data or data["metodo_pago"] not in ["tarjeta", "cartera"]:
            return jsonify({"error": "Método de pago inválido"}), 400

        if data["metodo_pago"] == "tarjeta":
            # Verificar tarjeta de pago
            if "id_tarjeta" not in data:
                return jsonify({"error": "Se requiere una tarjeta para este método de pago"}), 400
            tarjeta = TarjetaPago.query.filter_by(
                id_tarjeta=data["id_tarjeta"], id_cliente=current_user["id"]
            ).first()
            if not tarjeta:
                return jsonify({"error": "Tarjeta de pago no encontrada"}), 400

        elif data["metodo_pago"] == "cartera":
            # Verificar saldo en la cartera
            usuario = User.query.get(current_user["id"])
            if not usuario:
                return jsonify({"error": "Usuario no encontrado"}), 404
            if usuario.cartera < total:
                return jsonify({"error": "Saldo insuficiente en la cartera"}), 400

            # Descontar el saldo
            usuario.cartera -= total



        # Crear la venta
        nueva_venta = Venta(id_cliente=current_user["id"], total=total, descuento=data["descuento"])
        db.session.add(nueva_venta)
        db.session.commit()
        payload = {
            "id_venta": nueva_venta.id_venta
        }

        headers = {
            'Content-Type': 'application/json'
        }
        
        # Crear los detalles de la venta
        for detalle in detalles:
            nueva_venta_detalle = DetallesVenta(
                id_venta=nueva_venta.id_venta,
                id_producto=detalle.id_producto,
                cantidad=detalle.cantidad,
                subtotal=detalle.subtotal
            )
            db.session.add(nueva_venta_detalle)

            # Actualizar el stock del producto
            producto = Producto.query.get(detalle.id_producto)
            if producto.stock < detalle.cantidad:
                return jsonify({"error": f"Stock insuficiente para el producto {producto.nombre_producto}"}), 400
            # producto.stock -= detalle.cantidad

        DetallesCarrito.query.filter_by(id_carrito=carrito.id_carrito).delete()
        db.session.commit()
        # response = requests.post("http://127.0.0.1:4001/api/notificacion", json=payload, headers=headers)
        # if response.status_code == 200:
        #     print('Respuesta de la API en Node.js:', response.json())
        # else:
        #     print('Error:', response.status_code, response.text)

        return jsonify({"message": "Compra confirmada", "total": total}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/tarjetas', methods=['GET'])
@jwt_required()
def get_tarjetas():
    current_user = json.loads(get_jwt_identity())
    try:
        tarjetas = TarjetaPago.query.filter_by(id_cliente=current_user["id"]).all()
        response = [
            {
                "id_tarjeta": tarjeta.id_tarjeta,
                "numero_tarjeta": tarjeta.numero_tarjeta,
                "fecha_vencimiento": tarjeta.fecha_vencimiento.strftime("%Y-%m"),
            } for tarjeta in tarjetas
        ]
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500