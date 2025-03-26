# Usar una imagen base de Python sobre Alpine
FROM python:3.11-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos del proyecto al contenedor
COPY . /app

# Instalar dependencias (si tienes un archivo requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto que utilizará la aplicación (por ejemplo, 5000 para Flask)
EXPOSE 3005

# Definir el comando para ejecutar la aplicación (ajústalo según tu caso)
CMD ["python", "app.py"]
