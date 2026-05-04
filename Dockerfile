FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx tsc --project tsconfig.json
EXPOSE 8080 3702/udp
CMD ["node", "dist/src/server.js"]
