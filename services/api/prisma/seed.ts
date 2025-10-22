import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Investment Products
  const liquidFund = await prisma.investmentProduct.upsert({
    where: { id: 'liquid-fund-a' },
    update: {},
    create: {
      id: 'liquid-fund-a',
      name: 'Liquid Fund A',
      category: 'Liquid Fund',
      riskLevel: 'LOW',
      expectedReturn: 4.5,
      minInvestment: 100,
      exitLoad: 0,
      expenseRatio: 0.25,
      fundSize: 500000,
      description: 'Low risk liquid fund with instant redemption. Ideal for parking short-term savings.',
      isActive: true,
    },
  });

  const debtFund = await prisma.investmentProduct.upsert({
    where: { id: 'debt-fund-b' },
    update: {},
    create: {
      id: 'debt-fund-b',
      name: 'Short-Term Debt Fund B',
      category: 'Debt Fund',
      riskLevel: 'LOW',
      expectedReturn: 7.0,
      minInvestment: 500,
      exitLoad: 0,
      expenseRatio: 0.45,
      fundSize: 750000,
      description: 'Short-term debt fund with stable returns. Slightly higher risk than liquid funds.',
      isActive: true,
    },
  });

  const digitalGold = await prisma.investmentProduct.upsert({
    where: { id: 'digital-gold' },
    update: {},
    create: {
      id: 'digital-gold',
      name: 'Digital Gold',
      category: 'Gold',
      riskLevel: 'MEDIUM',
      expectedReturn: 8.0,
      minInvestment: 10,
      exitLoad: 0,
      description: 'Invest in 24K digital gold with instant liquidity. Market-linked returns.',
      isActive: true,
    },
  });

  // Seed NAV History (last 30 days)
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    await prisma.navHistory.upsert({
      where: {
        productId_date: {
          productId: liquidFund.id,
          date: date,
        },
      },
      update: {},
      create: {
        productId: liquidFund.id,
        date: date,
        nav: 12.45 + Math.random() * 0.1 - 0.05, // Random NAV around 12.45
      },
    });

    await prisma.navHistory.upsert({
      where: {
        productId_date: {
          productId: debtFund.id,
          date: date,
        },
      },
      update: {},
      create: {
        productId: debtFund.id,
        date: date,
        nav: 15.80 + Math.random() * 0.15 - 0.075,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📦 Created investment products:');
  console.log('  - Liquid Fund A');
  console.log('  - Short-Term Debt Fund B');
  console.log('  - Digital Gold');
  console.log('📈 Created 30 days of NAV history for each fund');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
