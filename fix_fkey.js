const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const storeMembers = await prisma.storeMember.findMany();
  const users = await prisma.user.findMany();
  const userIds = new Set(users.map(u => u.id));
  
  for (const member of storeMembers) {
    if (!userIds.has(member.userId)) {
      console.log(`Deleting orphaned StoreMember ${member.id} with bad userId ${member.userId}`);
      await prisma.storeMember.delete({ where: { id: member.id } });
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
