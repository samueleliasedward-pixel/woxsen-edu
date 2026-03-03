import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully!');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    console.log('Users in database:', users.length);
    if (users.length > 0) {
      console.log('First user:', users[0]);
    } else {
      console.log('No users found in database');
    }

    await prisma.$disconnect();
    console.log('Test completed');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();