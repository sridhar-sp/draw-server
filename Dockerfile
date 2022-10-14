FROM node:14-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY src src/
COPY tsconfig.json .
COPY .env .

RUN npm run build