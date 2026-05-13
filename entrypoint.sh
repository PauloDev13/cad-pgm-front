#!/bin/sh

# Avisa no log do Docker o que está acontecendo
echo "Iniciando Frontend. Injetando API_URL: ${API_URL}"

# Garante que a pasta 'assets' exista. Se já existir, ele não faz nada.
mkdir -p /usr/share/nginx/html/assets

# Reescreve o arquivo env.js com o valor da variável de ambiente do Docker
# echo "(function(window) { window.__env = window.__env || {}; window.__env.apiUrl = '${API_URL}'; })(this);" > /usr/share/nginx/html/assets/env.js

# Se API_URL estiver vazia, ele injeta um valor padrão de segurança
echo "(function(window) {
  window.__env = window.__env || {};
  window.__env.apiUrl = '${API_URL:-http://localhost:8080}';
  })(this);" > /usr/share/nginx/html/assets/env.js

# Inicia o servidor web Nginx em primeiro plano
exec nginx -g "daemon off;"
