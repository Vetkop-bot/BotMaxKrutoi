FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Also trust the Russian Trusted Root CA used by platform-api2.max.ru
ENV NODE_EXTRA_CA_CERTS=/app/certs/russian_trusted_root_ca.pem

USER node
EXPOSE 3000
CMD ["node", "index.js"]
