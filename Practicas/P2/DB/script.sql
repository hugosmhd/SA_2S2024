-- CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE PlataformaReservas;
USE PlataformaReservas;

-- MICROSERVICIO: Servicio de Usuarios
-- Incluye la gestión de usuarios y retroalimentación
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Retroalimentacion (
    id_retroalimentacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- MICROSERVICIO: Servicio de Clases
-- Incluye el registro y control de clases
CREATE TABLE Clases (
    id_clase INT AUTO_INCREMENT PRIMARY KEY,
    nombre_clase VARCHAR(100) NOT NULL,
    descripcion TEXT,
    capacidad INT NOT NULL,
    id_horario INT NOT NULL,
    FOREIGN KEY (id_horario) REFERENCES Horarios(id_horario) ON DELETE CASCADE
);

CREATE TABLE Reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_clase INT NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_clase) REFERENCES Clases(id_clase) ON DELETE CASCADE
);

-- MICROSERVICIO: Servicio de Pagos
-- Incluye la gestión de pagos y transacciones
CREATE TABLE Pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('Tarjeta', 'PayPal', 'Transferencia') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE Transacciones (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_pago INT NOT NULL,
    estado ENUM('Pendiente', 'Completado', 'Fallido') NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pago) REFERENCES Pagos(id_pago) ON DELETE CASCADE
);

-- MICROSERVICIO: Servicio de Horarios
-- Incluye CRUD de horarios y asignación de clases a maestros
CREATE TABLE Horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    dia ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);

CREATE TABLE Maestros (
    id_maestro INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    especialidad VARCHAR(100)
);

CREATE TABLE AsignacionClases (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_maestro INT NOT NULL,
    id_clase INT NOT NULL,
    FOREIGN KEY (id_maestro) REFERENCES Maestros(id_maestro) ON DELETE CASCADE,
    FOREIGN KEY (id_clase) REFERENCES Clases(id_clase) ON DELETE CASCADE
);

-- VISTAS Y SEGMENTACIÓN POR MICROSERVICIO
-- Vista para el servicio de usuarios
CREATE VIEW VistaUsuarios AS
SELECT id_usuario, nombre, email, telefono, fecha_registro
FROM Usuarios;

-- Vista para el servicio de clases
CREATE VIEW VistaClases AS
SELECT Clases.id_clase, Clases.nombre_clase, Clases.descripcion, Clases.capacidad, Horarios.dia, Horarios.hora_inicio, Horarios.hora_fin
FROM Clases
JOIN Horarios ON Clases.id_horario = Horarios.id_horario;

-- Vista para el servicio de pagos
CREATE VIEW VistaPagos AS
SELECT Pagos.id_pago, Pagos.id_usuario, Pagos.monto, Pagos.fecha_pago, Pagos.metodo_pago, Transacciones.estado
FROM Pagos
JOIN Transacciones ON Pagos.id_pago = Transacciones.id_pago;

-- Vista para el servicio de horarios
CREATE VIEW VistaHorarios AS
SELECT id_horario, dia, hora_inicio, hora_fin
FROM Horarios;
