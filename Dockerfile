FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc --project tsconfig.json

FROM bluenviron/mediamtx:latest AS mediamtx

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=mediamtx /mediamtx /usr/local/bin/mediamtx
EXPOSE 8080 8554 3702/udp
CMD ["node", "dist/src/server.js"]
