# Install dependencies only when needed
FROM node:24@sha256:20988bcdc6dc76690023eb2505dd273bdeefddcd0bde4bfd1efe4ebf8707f747 AS deps
WORKDIR /app

RUN corepack enable

# Copy only dependency-related files for better layer caching
COPY package.json yarn.lock .yarnrc.yml .npmrc ./
COPY .yarn ./.yarn

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    --mount=type=cache,target=/app/.yarn/cache \
    echo '//npm.pkg.github.com/:_authToken='$(cat /run/secrets/NODE_AUTH_TOKEN) >> .npmrc && \
    export NPM_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    yarn install --immutable

# Rebuild the source code only when needed
FROM node:24@sha256:20988bcdc6dc76690023eb2505dd273bdeefddcd0bde4bfd1efe4ebf8707f747 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./

# Copy source files (tests excluded via .dockerignore)
COPY package.json yarn.lock next.config.js tsconfig.json ./
COPY public ./public
COPY pages ./pages
COPY components ./components
COPY state ./state
COPY utils ./utils
COPY validators ./validators
COPY schema ./schema
COPY config ./config
COPY styles ./styles
COPY next-logger.config.js next-env.d.ts ./

ARG BUILDMODE
ENV BUILDMODE=${BUILDMODE}

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=${BUILDMODE}

RUN echo "BUILDMODE" "${BUILDMODE}"

COPY ${BUILDMODE}.env .env

RUN --mount=type=cache,target=/app/.next/cache \
    yarn build && rm -f .npmrc

# Production image, copy all the files and run next
FROM gcr.io/distroless/nodejs24-debian12@sha256:a372d09952e185540260d95bd717632af9d61c482acac224da6dde0ddb3d2f01 AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["server.js"]
