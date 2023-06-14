# base image
FROM node:14.17.6-alpine

# set working directory
WORKDIR /app

# copy project files
COPY . .

# install dependencies
RUN npm install

# build project
RUN npm run build

# expose port 8080
EXPOSE 8080

# start the app
CMD ["npm", "run", "serve"]