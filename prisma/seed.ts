import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create Super Admin
  const adminEmail = "admin@roxanlabs.ai";
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: "admin-password", // Simple for MVP
        role: "SUPER_ADMIN",
        tenant: {
          create: {
            name: "Roxan Labs Admin HQ",
            vapiAssistantId: "admin-assistant-id", // Placeholder
            vapiPhoneNumberId: "admin-phone-id", // Placeholder
          },
        },
      },
    });
    console.log("✅ Super Admin created: admin@roxanlabs.ai/ admin-password");
  }

  // Create First Tenant (You)
  const userEmail = "user@demo.com";
  const userExists = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!userExists) {
    await prisma.user.create({
      data: {
        email: userEmail,
        password: "user-password",
        role: "TENANT",
        tenant: {
          create: {
            name: "Demo Clinic",
            vapiAssistantId: "demo-assistant-id",
            vapiPhoneNumberId: "demo-phone-id",
          },
        },
      },
    });
    console.log("✅ Demo Tenant created: user@demo.com / user-password");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
