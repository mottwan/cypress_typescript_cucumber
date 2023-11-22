FROM cypress/base:18.16.0
WORKDIR /e2e_node_modules
COPY ./package*.json .
RUN npm install
WORKDIR /e2e