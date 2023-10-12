FROM node:18-alpine AS dependencies

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN apk --no-cache -U add git curl
RUN mkdir -p /home/app/ && chown -R node:node /home/app
WORKDIR /home/app
COPY package.json yarn.lock ./

USER node

RUN yarn install --frozen-lockfile

FROM node:18-alpine AS build

WORKDIR /home/app
COPY --from=dependencies /home/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npx prisma generate
RUN yarn build

# Write down production-ready commands here

EXPOSE 3000
CMD [ "yarn", "start" ]
