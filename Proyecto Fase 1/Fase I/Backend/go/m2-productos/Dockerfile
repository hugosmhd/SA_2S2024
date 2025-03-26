# Utiliza una imagen base de Alpine con Go ya instalado
FROM golang:alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el código fuente al contenedor
COPY . .

# Compila la aplicación de Go
RUN go build -o m2-productos

EXPOSE 3001
CMD ["./m2-productos"]