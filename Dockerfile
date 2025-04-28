
FROM node:18.18-alpine

WORKDIR /myapp
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
RUN npm install bcrypt
COPY . .
RUN npx prisma generate
# RUN npm run build
CMD npm run start:dev

