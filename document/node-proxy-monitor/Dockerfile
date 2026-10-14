FROM node:18-alpine

WORKDIR /src
COPY package.json package-lock.json /src/
RUN npm install --production

COPY public/ /src/public
COPY models/ /src/models
COPY views/ /src/views
COPY malicious.ejs /src/
COPY server.js /src/

CMD ["node", "server.js"]