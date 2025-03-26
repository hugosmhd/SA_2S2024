# Usar una imagen base de Python sobre Alpine
FROM python:3.11-alpine

# Instalar dependencias del sistema necesarias para mysqlclient
RUN apk add --no-cache \
    gcc \
    musl-dev \
    mariadb-dev \
    libffi-dev \
    pkgconfig

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos del proyecto al contenedor
COPY . /app

# Instalar dependencias (requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5060

# Definir el comando para ejecutar la aplicación
CMD ["python", "app.py"]