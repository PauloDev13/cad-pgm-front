# Estágio 1: Build do Angular
FROM node:20-alpine AS builder
WORKDIR /app

# NOVO: Instala o Angular CLI globalmente dentro do container!
RUN npm install -g @angular/cli --verbose

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

# --- INÍCIO DAS ALTERAÇÕES PARA VARIÁVEIS DINÂMICAS ---

# 1. Copia o script entrypoint.sh para a raiz do container
COPY entrypoint.sh /entrypoint.sh

# 2. Dá permissão de execução para o script
RUN chmod +x /entrypoint.sh

# Expõe a porta 8080 (mantido conforme original)
EXPOSE 8080

# 3. Substituímos o CMD pelo ENTRYPOINT.
# O contêiner agora "nasce" executando o script, que injeta o .env e depois inicia o Nginx.
ENTRYPOINT ["/entrypoint.sh"]
