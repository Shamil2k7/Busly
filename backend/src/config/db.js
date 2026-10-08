const { PrismaClient } = require('@prisma/client');

let prisma;

// Re-use single PrismaClient instance across hot-reloads and serverless function invocations
if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}
prisma = global.prisma;

module.exports = prisma;
