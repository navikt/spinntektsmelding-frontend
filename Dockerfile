# Install dependencies only when needed
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
# ARG NODE_AUTH_TOKEN
# COPY .npmrc.docker .npmrc 
# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc ./
RUN corepack enable
RUN yarn set version berry
COPY .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    echo '//npm.pkg.github.com/:_authToken='$(cat /run/secrets/NODE_AUTH_TOKEN) >> .npmrc

# RUN npm config set always-auth true   # Er ikke støttet lengre, men kan den bare slettes?

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    export NPM_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    yarn install --immutable --ignore-scripts


# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


ARG BUILDMODE
ENV BUILDMODE ${BUILDMODE}

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

ENV NODE_ENV ${BUILDMODE}

RUN echo "BUILDMODE" ${BUILDMODE}

COPY ${BUILDMODE}.env .env

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build
RUN rm -f .npmrc

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
# CMD ["node_modules/.bin/next", "start"]
