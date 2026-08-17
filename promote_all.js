const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      platformRole: 'SUPER_ADMIN',
    },
  });
  console.log(`Promoted ${result.count} users to SUPER_ADMIN`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
