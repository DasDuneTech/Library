FROM node:slim

WORKDIR /app

COPY package.json ./

RUN npm install
RUN npm i form-data
RUN npm i dotenv
RUN npm install node-fetch@2

COPY . /app

EXPOSE 8080

CMD ["node", "server.js"]