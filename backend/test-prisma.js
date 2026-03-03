import prisma from './src/config/db.js';

async function testPrisma() {
  try {
    console.log('Testing Prisma connection...');
    await prisma.();
    console.log('✅ Prisma connected successfully');
    
    const result = await prisma.\SELECT 1 as test\;
    console.log('✅ Query executed:', result);
    
    await prisma.();
    console.log('✅ Prisma disconnected');
  } catch (error) {
    console.error('❌ Prisma error:', error);
  }
}

testPrisma();
