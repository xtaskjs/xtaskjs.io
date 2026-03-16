FROM node:current-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN  npm install -g npm@11.11.1
RUN npm i

COPY . .

RUN mkdir -p public/uploads && chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
