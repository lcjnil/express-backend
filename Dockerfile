FROM kkarczmarczyk/node-yarn:7.6-slim

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN yarn

# Bundle app source
COPY . /usr/src/app

EXPOSE 5000
CMD [ "npm", "run", "start" ]
