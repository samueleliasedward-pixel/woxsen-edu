import { PrismaClient } from '@prisma/client'; 
import logger from '../utils/logger.js'; 
 
const prisma = new PrismaClient({ 
  log: [ 
    { level: 'warn', emit: 'event' }, 
    { level: 'error', emit: 'event' }, 
    { level: 'info', emit: 'event' }, 
    { level: 'query', emit: 'event' }, 
  ], 
}); 
 
prisma.$on('warn', (e) => logger.warn(e)); 
prisma.$on('info', (e) => logger.info(e)); 
prisma.$on('error', (e) => logger.error(e)); 
prisma.$on('query', (e) => { 
  if (process.env.NODE_ENV === 'development') { 
    logger.debug(`Query: ${e.query} - ${e.params} - ${e.duration}ms`); 
  } 
}); 
 
export const connectDB = async () => { 
  try { 
    await prisma.$connect(); 
    logger.info('   Database connected successfully'); 
  } catch (error) { 
    logger.error('  Database connection failed:', error); 
    process.exit(1); 
  } 
}; 
 
export const disconnectDB = async () => { 
  await prisma.$disconnect(); 
  logger.info('Database disconnected'); 
}; 
 
export default prisma;