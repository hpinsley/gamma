# Stage 1: Build the React client
FROM node:18 AS build-client
WORKDIR /app
COPY ./promptman/package.json ./promptman/package-lock.json ./promptman/
RUN cd promptman && npm install
COPY ./promptman ./promptman
RUN cd promptman && npm run build

# Stage 2: Build the Node server
FROM node:18 AS build-server
WORKDIR /app
COPY ./server/package.json ./server/package-lock.json ./server/
RUN cd server && npm install
COPY ./server ./server
RUN cd server && npm run build

# Stage 3: Combine the builds and set up the server to serve the client
FROM node:18
WORKDIR /app
COPY --from=build-server /app/server /app/server
COPY --from=build-client /app/promptman/build /app/server/public
WORKDIR /app/server

ENV NODE_ENV=production
RUN npm install --production

# Use build argument for API key
EXPOSE 8080
CMD ["node", "dist/app.js"]