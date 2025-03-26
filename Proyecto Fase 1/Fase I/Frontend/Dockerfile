# Usar una imagen base de Node.js
FROM node:18-alpine

# Crear y establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el archivo package.json y package-lock.json (si existe) al contenedor
COPY package.json package-lock.json ./

# Instalar las dependencias
RUN npm install

# Configurar la variable de entorno
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar el resto de los archivos de la aplicación al contenedor
COPY . .

# Construir la aplicación de React para producción
RUN npm run build

# Exponer el puerto que la aplicación utilizará
EXPOSE 3000

# Comando para iniciar la aplicación cuando se inicie el contenedor
CMD ["npm", "run", "dev", "--", "--host"]
