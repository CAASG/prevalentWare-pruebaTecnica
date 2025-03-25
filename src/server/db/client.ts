import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client with proper connection handling
export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
});

// Ensure proper connection handling
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Handle connection errors gracefully
prisma.$connect().catch((err) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Failed to connect to the database:', err);
  }
});

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