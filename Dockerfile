# Etapa de build
# Etapa 1: Build de la aplicación React
FROM node:18-alpine as build

WORKDIR /

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx configurado para SPA
FROM nginx:alpine

# Copiamos los archivos generados por React
# COPY --from=build /app/build /usr/share/nginx/html

# Reemplazamos la configuración por una personalizada para SPA
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 por si lo usás manualmente
EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]