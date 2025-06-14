FROM node:18.18-alpine

WORKDIR /myapp

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install
RUN npm install bcrypt

COPY . .

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate reset --force && npm run start:dev"]
