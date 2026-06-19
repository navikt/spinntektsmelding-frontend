# Install dependencies only when needed
FROM node:26-bookworm-slim@sha256:79723b41edbedf595f62e943a9f8b0ba9af5b1e61045c5f8f59c2c02c1212a16 AS deps
WORKDIR /app

RUN npm install -g --force corepack && corepack enable

# Copy only dependency-related files for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    NODE_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) \
    pnpm install --frozen-lockfile  --ignore-scripts

# Rebuild the source code only when needed
FROM node:26-bookworm-slim@sha256:79723b41edbedf595f62e943a9f8b0ba9af5b1e61045c5f8f59c2c02c1212a16 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy source files (tests excluded via .dockerignore)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml next.config.js tsconfig.json ./
COPY public ./public
COPY pages ./pages
COPY components ./components
COPY state ./state
COPY utils ./utils
COPY validators ./validators
COPY schema ./schema
COPY config ./config
COPY styles ./styles
COPY next-logger.config.mjs ./

ARG BUILDMODE
ENV BUILDMODE=${BUILDMODE}

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=${BUILDMODE}

RUN echo "BUILDMODE" "${BUILDMODE}"

COPY ${BUILDMODE}.env .env

RUN npm install -g --force --ignore-scripts corepack && corepack enable

RUN --mount=type=cache,target=/app/.next/cache \
    pnpm build

# pino loads its transports (here pino-socket, used by @navikt/next-logger's
# team-logger) in a worker thread via a dynamic string target. Next.js' output
# file tracing can't see this dynamic require, so pino-socket and its transitive
# dependencies are never copied into .next/standalone. We install a flat,
# self-contained copy (matching the version pnpm resolved) into the standalone
# node_modules so the transport can be resolved at runtime.
RUN PS_VER=$(node -p "require('./node_modules/pino-socket/package.json').version") \
    && npm install --prefix /tmp/pino-socket "pino-socket@${PS_VER}" --omit=dev --no-audit --no-fund \
    && cp -R /tmp/pino-socket/node_modules/. /app/.next/standalone/node_modules/

# Production image, copy all the files and run next
FROM gcr.io/distroless/nodejs24-debian12@sha256:61f4f4341db81820c24ce771b83d202eb6452076f58628cd536cc7d94a10978b AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=nonroot:nonroot --chmod=0555 /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nonroot:nonroot --chmod=0555 /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot --chmod=0555 /app/.next/static ./.next/static

USER nonroot

EXPOSE 3000

ENV PORT=3000

CMD ["server.js"]
