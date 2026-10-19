FROM node:22-bookworm-slim

WORKDIR /app

COPY server/package.json server/package-lock.json ./server/

RUN npm ci --prefix server --omit=dev

COPY server/ ./server/
COPY client/ ./client/

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server/server.js"]
