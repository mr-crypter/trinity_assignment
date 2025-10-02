# backend/Dockerfile
FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:18-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["node", "src/index.js"]



