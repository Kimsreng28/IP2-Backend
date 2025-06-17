# ===========================
# Build Stage
# ===========================
FROM node:20-alpine AS builder

WORKDIR /myapp

# Install build dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++

# Copy package files for caching
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies)
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

# Install runtime dependencies (e.g., for Prisma)
RUN apk add --no-cache python3

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only necessary files
COPY --from=builder /myapp/dist ./dist
COPY --from=builder /myapp/package*.json ./
COPY --from=builder /myapp/prisma ./prisma

# Install only production dependencies
RUN npm ci --only=production

# Set non-root user
USER appuser

# Expose the port
EXPOSE 3001

# Start the app
CMD ["node", "dist/main"]