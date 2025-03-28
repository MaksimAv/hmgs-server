FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY ./dist ./dist
EXPOSE 5000
CMD [ "npm" "run" "start:dev:app" ]
