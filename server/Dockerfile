FROM node:20-alpine

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY server/package.json server/tsconfig.json server/prisma ./server/
COPY shared/package.json shared/tsconfig.json shared/src ./shared/

RUN corepack enable \
  && pnpm install --filter @codex/shared --filter server

RUN pnpm --filter @codex/shared build \
  && pnpm --filter server build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter server prisma:generate && pnpm --filter server prisma:deploy && node server/dist/index.js"]
