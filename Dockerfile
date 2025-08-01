# Usa a imagem oficial do Node.js como base
FROM node:18-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia PRIMEIRO os arquivos de dependência para otimizar o cache
COPY backend/package.json backend/package-lock.json* ./

# Instala as dependências
RUN npm install

# AGORA copia o resto do código do backend
COPY backend/ .

# Expõe a porta que a aplicação usa
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
