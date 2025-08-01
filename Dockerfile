# Usa a imagem oficial do Node.js como base
FROM node:18-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia a pasta inteira do backend para dentro do diretório de trabalho /app
COPY backend/ .

# Executa a instalação das dependências
# O npm vai encontrar o package.json na raiz do diretório de trabalho
RUN npm install

# Expõe a porta que a aplicação usa
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
