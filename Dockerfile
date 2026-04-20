# Estágio 1: Build do Angular
FROM node:20-alpine AS builder
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./
RUN npm ci

# Copia o restante do código
COPY . .

# Faz o build de produção
RUN npm run build -- --configuration production

# Estágio 2: Nginx Web Server
FROM nginx:alpine

# Limpa o diretório padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos da subpasta 'browser' gerada pelo Angular
COPY --from=builder /app/dist/cad-pgm-front/browser /usr/share/nginx/html

# NOVO: Embutindo o nginx.conf definitivamente na imagem!
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 8080 do container
EXPOSE 8080

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
