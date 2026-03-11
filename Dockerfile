FROM node:20

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Prisma schema
COPY prisma ./prisma
RUN npx prisma generate

# Application source
COPY tsconfig.json ./tsconfig.json
COPY src ./src

# Build TypeScript
RUN npm run build

ENV NODE_ENV=production
ENV PORT=4000

# On container start: run migrations then start API
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/index.js"]

