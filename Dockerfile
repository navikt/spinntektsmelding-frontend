# Install dependencies only when needed
FROM node:25-bookworm-slim@sha256:32f45869cf02c26971de72c383d5f99cab002905ed8b515b56df925007941782 AS deps
WORKDIR /app

RUN npm install -g --force corepack && corepack enable

# Copy only dependency-related files for better layer caching
COPY package.json pnpm-lock.yaml .npmrc ./

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    --mount=type=cache,target=/root/.pnpm-store \
    echo '//npm.pkg.github.com/:_authToken='$(cat /run/secrets/NODE_AUTH_TOKEN) >> .npmrc && \
    export NPM_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    pnpm install --frozen-lockfile  --ignore-scripts

# Rebuild the source code only when needed
FROM node:25-bookworm-slim@sha256:32f45869cf02c26971de72c383d5f99cab002905ed8b515b56df925007941782 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy source files (tests excluded via .dockerignore)
COPY package.json pnpm-lock.yaml next.config.js tsconfig.json ./
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

RUN corepack enable

RUN --mount=type=cache,target=/app/.next/cache \
    pnpm build && rm -f .npmrc

# Production image, copy all the files and run next
FROM gcr.io/distroless/nodejs24-debian12@sha256:61f4f4341db81820c24ce771b83d202eb6452076f58628cd536cc7d94a10978b AS runner
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
