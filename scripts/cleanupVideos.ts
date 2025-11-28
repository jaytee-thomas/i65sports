import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Get your user ID
    const yourUser = await prisma.user.findUnique({
      where: { email: 'i65sport@gmail.com' }
    });

    if (!yourUser) {
      console.log('User not found');
      return;
    }

    console.log(`Your user ID: ${yourUser.id}`);

    // Delete all hot takes NOT from you
    const deleted = await prisma.hotTake.deleteMany({
      where: {
        authorId: {
          not: yourUser.id
        }
      }
    });

    console.log(`✅ Deleted ${deleted.count} hot takes`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

