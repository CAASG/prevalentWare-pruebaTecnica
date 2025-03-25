import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Configuration with connection handling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    // Add connection pool configuration that is officially supported
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit during hot reloads.
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Improved connection handling with retry logic
const connectWithRetry = async (maxRetries = 3, delay = 1000) => {
  let currentAttempt = 0;
  
  while (currentAttempt < maxRetries) {
    try {
      await prisma.$connect();
      console.log('✅ Successfully connected to the database');
      return;
    } catch (error) {
      currentAttempt++;
      console.error(`❌ Database connection attempt ${currentAttempt} failed:`, error);
      
      if (currentAttempt >= maxRetries) {
        console.error('❌ Max retries reached. Could not connect to database.');
        return;
      }
      
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next retry (exponential backoff)
      delay *= 2;
    }
  }
};

// Initialize connection
connectWithRetry();

export default prisma;