# Estágio 1: Build da Aplicação
# Usamos uma imagem oficial do Node.js
FROM node:18-slim AS base

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia AMBOS os arquivos package.json e package-lock.json para a raiz do app
# Isso otimiza o cache do Docker
COPY package.json ./
COPY package-lock.json* ./

# Copia o resto do código do backend
COPY backend/ ./backend/

# Instala as dependências DENTRO da pasta backend
RUN npm install --prefix backend

# Estágio 2: Produção
# Usamos uma imagem menor para a versão final
FROM node:18-slim

WORKDIR /app

# Copia as dependências instaladas e o código do estágio de build
COPY --from=base /app/backend ./

# Expõe a porta que a sua aplicação usa (geralmente 3000, mas o Render ajusta isso)
EXPOSE 3000

# O comando para iniciar a sua aplicação
CMD ["npm", "start"]
