# ===========================
# Build Stage
# ===========================
FROM node:20-alpine AS builder

WORKDIR /myapp

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# ===========================
# Production Stage
# ===========================
FROM node:20-alpine

WORKDIR /myapp

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy necessary files
COPY --from=builder /myapp/dist ./dist
COPY --from=builder /myapp/node_modules ./node_modules
COPY --from=builder /myapp/package*.json ./
COPY --from=builder /myapp/prisma ./prisma
COPY --from=builder /myapp/src/database/seed ./src/database/seed

# Set non-root user
USER appuser

# Expose the port
EXPOSE 3001

# Start the app with migrations and seeding
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seeder && npm run start:prod"]