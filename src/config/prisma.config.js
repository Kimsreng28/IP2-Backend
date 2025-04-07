"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ===========================================================================>> Core Library
const client_1 = require("@prisma/client");
// ===========================================================================>> Third Party Library
const dotenv = require("dotenv");
dotenv.config();
/** @MySQL and @PostgreSQL */
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: ['query', 'info', 'warn', 'error'], // Enable logging for debugging
});
exports.default = prisma;
