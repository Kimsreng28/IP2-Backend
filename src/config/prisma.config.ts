// ===========================================================================>> Core Library
import { PrismaClient } from '@prisma/client';

// ===========================================================================>> Third Party Library
import * as dotenv from 'dotenv';

dotenv.config();

/** @MySQL and @PostgreSQL */
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'], // Enable logging for debugging
});

export default prisma;
