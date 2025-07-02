FROM node:20.13.1-alpine

RUN mkdir -p /usr/src/nodeauth && chown -R node:node /usr/src/nodeauth

WORKDIR /usr/src/nodeauth

# Copy package json and yarn lock only to optimise the image building
COPY package.json yarn.lock ./

# copy prepare.js prior. It will be executed after package installation and before ROOT dir is cloned
COPY prepare.js ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "npm", "start" ]