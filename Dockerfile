# Etapa 1: Build de la aplicación React
FROM node:22-alpine as build

# Es mejor usar /app para evitar conflictos en la raíz
WORKDIR /app

COPY package*.json ./
RUN npm install

# DECLARA EL ARGUMENTO AQUÍ
ARG VITE_API_BASE_URL
# ESTABLECE LA VARIABLE PARA EL PROCESO DE VITE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build -- --mode production

# Etapa 2: Servir con Nginx
FROM nginx:alpine
# Copiamos los archivos de Vite (dist)
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos TU configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
