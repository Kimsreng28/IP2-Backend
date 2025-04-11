## Installation
```bash
$ npm install
```

## Running the app
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Migration & Seeding
```bash
# migrate
$ npm install prisma --save-dev
$ npm run migrate
$ npx prisma migrate dev --name init
# seed
$ npm run seeder
# reset
$ npx prisma migrate reset
$ npx prisma db push --force-reset
# show table 
$ npx prisma studio
```
