from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "Usuarios"
    id_usuario = db.Column(db.Integer, primary_key=True)
    tipo_usuario = db.Column(db.Enum("Proveedor", "Cliente","Admin"), nullable=False)
    nombre_empresa = db.Column(db.String(100), nullable=True)
    nombres = db.Column(db.String(100), nullable=True)
    apellidos = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    direccion = db.Column(db.String(255), nullable=True)
    celular = db.Column(db.String(15), nullable=True)
    fotografia = db.Column(db.String(500), nullable=True)  # Columna para la URL de la foto
    cartera = db.Column(db.Numeric(10, 2), nullable=False)

class Categoria(db.Model):
    __tablename__ = "Categorias"
    id_categoria = db.Column(db.Integer, primary_key=True)
    nombre_categoria = db.Column(db.String(100), nullable=False)

# Ajustar el modelo Producto para establecer la relación con Categorias
class Producto(db.Model):
    __tablename__ = "Productos"
    id_producto = db.Column(db.Integer, primary_key=True)
    id_proveedor = db.Column(db.Integer, nullable=False)  # Agregado
    nombre_producto = db.Column(db.String(255), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    id_categoria = db.Column(db.Integer, db.ForeignKey("Categorias.id_categoria"), nullable=False)
    categoria = db.relationship("Categoria", backref="productos")
    imagen_producto = db.Column(db.String(500), nullable=True)


class ProductoExterno(db.Model):
    __tablename__ = "ProductosExternos"
    id_producto = db.Column(db.Integer, primary_key=True)
    id_proveedor = db.Column(db.Integer, db.ForeignKey("Usuarios.id_usuario"), nullable=False)
    categoria = db.Column(db.String(100), nullable=False)  # Categoría como texto
    sku = db.Column(db.String(50), unique=True, nullable=False)  # SKU único
    nombre_producto = db.Column(db.String(255), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, nullable=False)  # Stock no puede ser negativo
    imagen_producto = db.Column(db.String(500), nullable=True)  # URL de la imagen
    etiqueta = db.Column(db.Enum("Proveedor Externo", "Proveedor Interno"), default="Proveedor Interno", nullable=False)
    num_grupo = db.Column(db.Integer, nullable=False)  # Número del grupo proveedor

class Carrito(db.Model):
    __tablename__ = "Carrito"
    id_carrito = db.Column(db.Integer, primary_key=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey("Usuarios.id_usuario"), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=db.func.current_timestamp())

class DetallesCarrito(db.Model):
    __tablename__ = "DetallesCarrito"
    id_detalle = db.Column(db.Integer, primary_key=True)
    id_carrito = db.Column(db.Integer, db.ForeignKey("Carrito.id_carrito"), nullable=False)
    id_producto = db.Column(db.Integer, db.ForeignKey("Productos.id_producto"), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

class Venta(db.Model):
    __tablename__ = "Ventas"
    id_venta = db.Column(db.Integer, primary_key=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey("Usuarios.id_usuario"), nullable=False)
    fecha_venta = db.Column(db.DateTime, default=db.func.current_timestamp())
    total = db.Column(db.Numeric(10, 2), nullable=False)

class DetallesVenta(db.Model):
    __tablename__ = "DetallesVentas"
    id_detalle = db.Column(db.Integer, primary_key=True)
    id_venta = db.Column(db.Integer, db.ForeignKey("Ventas.id_venta"), nullable=False)
    id_producto = db.Column(db.Integer, db.ForeignKey("Productos.id_producto"), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

class TarjetaPago(db.Model):
    __tablename__ = "TarjetasPago"
    id_tarjeta = db.Column(db.Integer, primary_key=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey("Usuarios.id_usuario"), nullable=False)
    numero_tarjeta = db.Column(db.String(16), nullable=False)
    fecha_vencimiento = db.Column(db.Date, nullable=False)
    cvc = db.Column(db.Integer, nullable=False)
