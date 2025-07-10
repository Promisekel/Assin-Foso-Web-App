import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 This seed file has been deprecated for production use.');
  console.log('');
  console.log('📋 FOR PRODUCTION DATABASE SETUP:');
  console.log('   Run: node prisma/production-seed.js');
  console.log('');
  console.log('🔧 FOR QUICK USER SETUP:');
  console.log('   Run: node fix-login.js');
  console.log('');
  console.log('⚠️  Demo/test data has been removed for production security.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
