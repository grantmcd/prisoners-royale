FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
# Install tsup globally or just rely on npx if not in package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
# Ensure tsup is available
RUN pnpm add -D tsup
# Run the build (client + server)
# Note: package.json "build" is "tsc && vite build", which only builds client to dist/client
# We need to build server too.
RUN pnpm exec tsup server/index.ts --format esm --out-dir dist/server && pnpm run build

FROM base AS runtime
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package.json
# Need node_modules for runtime deps (express, cors, etc)
COPY --from=build /app/node_modules /app/node_modules
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server/index.js"]
