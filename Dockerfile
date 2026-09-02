# --- Stage 1: build the SPA (Vite) ---
# Produces static HTML/JS/CSS under dist/ — copied into the final image as ./public.
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend

ENV COREPACK_ENABLE_STRICT=0
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml frontend/.pnpmrc ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./

# Empty = browser calls /api on the same host as the page (same domain as Express).
ENV VITE_API_URL=

# Public Clerk key (safe to pass as build-arg; it is embedded in client JS anyway)
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_IMAGEKIT_URL_ENDPOINT
ENV VITE_IMAGEKIT_URL_ENDPOINT=$VITE_IMAGEKIT_URL_ENDPOINT
ARG VITE_SENTRY_DSN
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN pnpm run build

# --- Stage 2: compile the API (TypeScript → JavaScript) ---
# Produces dist/ with index.js and the rest of the server bundle.
FROM node:24-alpine AS backend-build
WORKDIR /app/backend

ENV COREPACK_ENABLE_STRICT=0
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ ./

RUN pnpm run build

# --- Stage 3: runtime image (only prod deps + built assets) ---
# Express serves API routes and static files from public/ (the Vite build from stage 1).
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV COREPACK_ENABLE_STRICT=0

RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3001
USER node

CMD ["node", "--import", "./dist/instrument.js", "dist/index.js"]
