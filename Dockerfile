# Use Node.js with Alpine (musl)
FROM node:18.18-alpine

WORKDIR /myapp

# Install dependencies first (including Prisma)
COPY package*.json ./
RUN npm install

# Copy the application source code into the container
COPY . .

# Generate Prisma Client for the correct platform
RUN npx prisma generate

# Run Prisma migrations (Make sure your migrations are in place)
# RUN npx prisma migrate deploy

# Build the app (if using TypeScript)
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
