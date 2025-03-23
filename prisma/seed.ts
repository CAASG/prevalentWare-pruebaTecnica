// prisma/seed.ts
import { PrismaClient, TransactionType } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrator',
      role: 'ADMIN',
      phone: '+1234567890',
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      role: 'USER',
    },
  });

  console.log(`Created regular user: ${regularUser.email}`);

  // Create sample transactions
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(today.getMonth() - 2);

  // Sample income transactions
  const incomeTransactions = [
    {
      amount: 5000,
      concept: 'Monthly Salary',
      date: today,
      type: TransactionType.INCOME,
      userId: adminUser.id,
    },
    {
      amount: 4500,
      concept: 'Monthly Salary',
      date: oneMonthAgo,
      type: TransactionType.INCOME,
      userId: adminUser.id,
    },
    {
      amount: 4500,
      concept: 'Monthly Salary',
      date: twoMonthsAgo,
      type: TransactionType.INCOME,
      userId: adminUser.id,
    },
    {
      amount: 1000,
      concept: 'Freelance Project',
      date: new Date(today.setDate(today.getDate() - 15)),
      type: TransactionType.INCOME,
      userId: adminUser.id,
    },
  ];

  // Sample expense transactions
  const expenseTransactions = [
    {
      amount: 1200,
      concept: 'Rent',
      date: today,
      type: TransactionType.EXPENSE,
      userId: adminUser.id,
    },
    {
      amount: 1200,
      concept: 'Rent',
      date: oneMonthAgo,
      type: TransactionType.EXPENSE,
      userId: adminUser.id,
    },
    {
      amount: 1200,
      concept: 'Rent',
      date: twoMonthsAgo,
      type: TransactionType.EXPENSE,
      userId: adminUser.id,
    },
    {
      amount: 200,
      concept: 'Utilities',
      date: today,
      type: TransactionType.EXPENSE,
      userId: adminUser.id,
    },
    {
      amount: 180,
      concept: 'Utilities',
      date: oneMonthAgo,
      type: TransactionType.EXPENSE,
      userId: adminUser.id,
    },
    {
      amount: 350,
      concept: 'Groceries',
      date: new Date(today.setDate(today.getDate() - 7)),
      type: TransactionType.EXPENSE,
      userId: adminUser.id,
    },
    {
      amount: 60,
      concept: 'Internet',
      date: today,
      type: TransactionType.EXPENSE,
      userId: regularUser.id,
    },
  ];

  // Create all transactions
  for (const transaction of [...incomeTransactions, ...expenseTransactions]) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log(`Created ${incomeTransactions.length} income transactions`);
  console.log(`Created ${expenseTransactions.length} expense transactions`);
  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });