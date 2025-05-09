# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /app

# Copia os arquivos de projeto
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Compila a aplicação Next.js
RUN npm run build

# Etapa 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copia os artefatos da build e dependências
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
#COPY --from=builder /app/next.config.js ./next.config.js

# Define porta de execução
ENV PORT=3000

EXPOSE 3000

CMD ["npx", "next", "start"]