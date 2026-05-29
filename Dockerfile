FROM node:22-alpine AS base

WORKDIR /app

RUN npm install -g pnpm@11.4.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p public/uploads var/log && chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
