`README`
---

## 🚀 Backend Installation & Setup Guide

### 📦 Install Dependencies

```bash
npm install
```

---

## 🚀 Running the App

### 🧪 Development Mode

```bash
# Run normally
npm run start

# Run in watch mode (auto-restarts on changes)
npm run start:dev
```

---

## 🛠️ Prisma Migration & Database Management

### 📥 Install Prisma CLI

```bash
npm install prisma --save-dev
```

---

### 🔄 Local Development Migration

```bash
# Generate a new migration and apply it to the database
npx prisma migrate dev --name init

# Push schema changes to database without migration
npx prisma db push --force-reset
```

---

### 🌱 Seeding Data

```bash
npm run seeder
```

> Make sure `prisma/seed.ts` or the corresponding seed script is set up in `prisma` config inside `package.json`.

---

### ♻️ Reset Database (Development Only)

```bash
npx prisma migrate reset
npx prisma db push --force-reset
```

---

### 🧭 View Tables in Browser

```bash
npx prisma studio
```
---

## 📦 Production Migration Guide

In production, never use `prisma migrate dev`. Use `prisma migrate deploy` for safe migrations:

### ✅ Steps:

```bash
# Generate migration from development environment (done locally)
npx prisma migrate dev --name prod

# Commit the migration folder to git (e.g., prisma/migrations/20250617130749_prod)

# On the server, run:
npx prisma migrate deploy
```

> ✅ This applies only the **committed** and verified migrations in `prisma/migrations`.