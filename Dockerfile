# Estágio 1: Build da Aplicação
FROM node:18-slim AS base

WORKDIR /app

# Copia os arquivos de dependência do backend para a raiz do app
COPY backend/package.json ./
COPY backend/package-lock.json* ./

# Instala as dependências
RUN npm install

# Copia o resto do código do backend
COPY backend/ ./

# Estágio 2: Produção
FROM node:18-slim

WORKDIR /app

# Copia a aplicação com as dependências já instaladas do estágio anterior
COPY --from=base /app/ ./

# Expõe a porta que a sua aplicação usa
EXPOSE 3000

# O comando para iniciar a sua aplicação
CMD ["npm", "start"]
