const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Administrador Djavu';

  if (!adminEmail || !adminPassword) {
    throw new Error('Debes definir ADMIN_EMAIL y ADMIN_PASSWORD para ejecutar el seed.');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: passwordHash,
      role: Role.ADMIN,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Usuario admin listo:', admin.email, '| rol:', admin.role);

  const categories = ['Mesas', 'Sillas', 'Camas', 'Armarios', 'Estanterías', 'Escritorios'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Categorías base creadas/actualizadas.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
