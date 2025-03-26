# Creación del esquema de la base de datos en SQL
CREATE DATABASE eCommerce;

USE eCommerce;

-- Tabla de usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    tipo_usuario ENUM('Proveedor', 'Cliente') NOT NULL,
    nombre_empresa VARCHAR(100),
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    celular VARCHAR(15),
    fotografia VARCHAR(500),
    cartera DECIMAL(10, 2) NOT NULL
);

-- Tabla de categorías de productos
CREATE TABLE Categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL
);

-- Tabla de productos
CREATE TABLE Productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_categoria INT NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL CHECK (stock >= 0),
    imagen_producto VARCHAR(500),
    FOREIGN KEY (id_proveedor) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

-- Tabla de carritos de compras
CREATE TABLE Carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario)
);

-- Tabla de detalles del carrito
CREATE TABLE DetallesCarrito (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- Tabla de ventas
CREATE TABLE Ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario)
);

-- Tabla de detalles de ventas
CREATE TABLE DetallesVentas (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- Tabla de tarjetas de pago
CREATE TABLE TarjetasPago (
    id_tarjeta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    numero_tarjeta VARCHAR(16) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cvc INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario)
);

-- Vista para mostrar el catálogo de productos con precios ajustados
CREATE VIEW CatalogoProductos AS
SELECT 
    p.id_producto, 
    p.nombre_producto, 
    p.precio * 1.1 AS precio_final, 
    p.stock, 
    c.nombre_categoria
FROM Productos p
JOIN Categorias c ON p.id_categoria = c.id_categoria;

-- Procedimiento para registrar un nuevo usuario
DELIMITER //
CREATE PROCEDURE RegistrarUsuario (
    IN tipo ENUM('Proveedor', 'Cliente'),
    IN nombre_emp VARCHAR(100),
    IN nombres_usr VARCHAR(100),
    IN apellidos_usr VARCHAR(100),
    IN email_usr VARCHAR(255),
    IN pass_usr VARCHAR(255),
    IN direccion_usr VARCHAR(255),
    IN celular_usr VARCHAR(15)
)
BEGIN
    INSERT INTO Usuarios (tipo_usuario, nombre_empresa, nombres, apellidos, email, contrasena, direccion, celular)
    VALUES (tipo, nombre_emp, nombres_usr, apellidos_usr, email_usr, pass_usr, direccion_usr, celular_usr);
END //
DELIMITER ;

DELIMITER //

CREATE PROCEDURE ConfirmarCompra (
    IN id_carrito_compra INT,
    IN id_cliente_compra INT
)
BEGIN
    DECLARE total_compra DECIMAL(10, 2) DEFAULT 0;
    DECLARE id_venta_reciente INT;

    -- Calcular total
    SELECT SUM(subtotal) INTO total_compra
    FROM DetallesCarrito
    WHERE id_carrito = id_carrito_compra;

    -- Insertar en ventas
    INSERT INTO Ventas (id_cliente, total) VALUES (id_cliente_compra, total_compra);

    -- Obtener el ID de la venta reciente
    SET id_venta_reciente = LAST_INSERT_ID();

    -- Transferir detalles del carrito a DetallesVentas
    INSERT INTO DetallesVentas (id_venta, id_producto, cantidad, subtotal)
    SELECT id_venta_reciente, id_producto, cantidad, subtotal
    FROM DetallesCarrito WHERE id_carrito = id_carrito_compra;

    -- Eliminar productos del carrito
    DELETE FROM DetallesCarrito WHERE id_carrito = id_carrito_compra;
END //

DELIMITER ;