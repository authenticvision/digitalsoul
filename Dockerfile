FROM node:18-alpine AS dependencies

WORKDIR /srv/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

USER node

########################################################
FROM node:18-alpine AS builder

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
WORKDIR /srv/app

COPY . .
COPY --from=dependencies /srv/app/node_modules ./node_modules

RUN npx prisma generate
RUN yarn build


################################################################
FROM node:18-alpine AS runner

USER 1000
WORKDIR /srv/app
ENV NODE_ENV production

COPY --from=builder /srv/app/node_modules ./node_modules
COPY --from=builder /srv/app/package.json ./
COPY --from=builder /srv/app/next.config.js ./
COPY --from=builder /srv/app/prisma ./
COPY --from=builder /srv/app/schema.prisma ./

COPY --from=builder /srv/app/public ./public
COPY --from=builder /srv/app/.next ./.next

EXPOSE 3000

# Start directly via next, since yarn requires
# Filesystem write access to run a command. In production
# environments this may be problematic
CMD [ "node_modules/.bin/next", "start", "-H", "0.0.0.0" ]
