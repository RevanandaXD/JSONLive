FROM node:22-alpine

WORKDIR /app

RUN npm run ci

COPY . .

RUN npm run build

CMD [ "npm", "start" ]