FROM node:20-alpine AS builder
WORKDIR /app
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/telos?schema=public"
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build:prod

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/telos?schema=public"

RUN apk add --no-cache python3 g++ gcc openjdk17

COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src

EXPOSE 8787
CMD ["npm", "run", "start:prod"]
