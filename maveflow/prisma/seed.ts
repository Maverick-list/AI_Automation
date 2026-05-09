import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed sequence...");

  // 1. Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: "maverick@example.com" },
    update: {},
    create: {
      email: "maverick@example.com",
      name: "Maverick AI",
      plan: "PRO",
    },
  });
  console.log(`User created: ${user.name}`);

  // 2. Create a workspace for the user
  const workspace = await prisma.workspace.create({
    data: {
      name: "Personal Workspace",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });
  console.log(`Workspace created: ${workspace.name}`);

  // 3. Create a dummy automation workflow
  const automation = await prisma.automation.create({
    data: {
      name: "Auto Reply to Invoices",
      description: "When an email with 'invoice' arrives, forward it to finance.",
      workspaceId: workspace.id,
      trigger: {
        type: "gmail_new_email",
        config: { query: "subject:invoice has:attachment" },
      },
      actions: [
        {
          type: "gmail_send",
          config: {
            to: ["finance@example.com"],
            subject: "New Invoice Received",
            body: "Please process the attached invoice.",
          },
          order: 0,
        },
      ],
      isActive: true,
    },
  });
  console.log(`Automation created: ${automation.name}`);

  // 4. Create dummy run logs
  await prisma.automationRun.create({
    data: {
      automationId: automation.id,
      status: "SUCCESS",
      startedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      finishedAt: new Date(Date.now() - 1000 * 60 * 59),
      logs: [
        { level: "info", message: "Trigger detected: 1 new email." },
        { level: "info", message: "Action 1: Email forwarded to finance@example.com." },
        { level: "info", message: "Workflow completed successfully." }
      ],
    },
  });
  console.log("Mock automation run created.");

  console.log("Seed sequence finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
