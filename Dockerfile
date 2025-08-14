FROM node:22-alpine AS dependencies

WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

USER node

########################################################
FROM node:22-alpine AS builder

RUN apk add openssl
ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
WORKDIR /srv/app

COPY . .
COPY --from=dependencies /srv/app/node_modules ./node_modules

RUN npx prisma generate
RUN npm run build

# NextJS seems to have no intentions on supporting a
# different cache dir. They do seem to approve symlinking though
# https://github.com/vercel/next.js/discussions/35656
# https://github.com/vercel/next.js/issues/10111
# Note this is kind of dangerous, as it relies on /srv/data being the
# mount point of the volume!!
RUN rm -rf ./.next/cache
RUN ln -s /srv/data/next-cache ./.next/cache


################################################################
FROM node:22-alpine AS runner

USER 1000
WORKDIR /srv/app
ENV NODE_ENV production

COPY --from=builder /srv/app/node_modules ./node_modules
COPY --from=builder /srv/app/package.json ./
COPY --from=builder /srv/app/next.config.js ./
COPY --from=builder /srv/app/prisma ./

COPY --from=builder /srv/app/public ./public
COPY --from=builder /srv/app/.next ./.next


EXPOSE 3000

# Start directly via next, since yarn requires
# Filesystem write access to run a command. In production
# environments this may be problematic
CMD [ "node_modules/.bin/next", "start", "-H", "0.0.0.0" ]
