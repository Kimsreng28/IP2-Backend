# ===========================
# Build Stage
# ===========================
FROM node:20-alpine AS builder

WORKDIR /myapp

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Copy package files for caching
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies)
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

# Copy only necessary files
COPY --from=builder /myapp/dist ./dist
COPY --from=builder /myapp/node_modules ./node_modules
COPY --from=builder /myapp/package*.json ./
COPY --from=builder /myapp/prisma ./prisma

# Set non-root user
USER appuser

# Expose the port
EXPOSE 3001

# Start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]