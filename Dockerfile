FROM node:22-alpine

RUN corepack enable
RUN corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_APP_URL=https://jsonlive.revandev.my.id
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Prisma Generate Purpose
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN pnpm exec prisma generate
RUN pnpm run build

RUN mkdir -p .next/standalone/.next \
    && cp -r .next/static .next/standalone/.next/static \
    && cp -r public .next/standalone/public

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && exec node .next/standalone/server.js"]