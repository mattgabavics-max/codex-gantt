import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "qa@example.com" },
    update: {},
    create: {
      email: "qa@example.com",
      passwordHash: "$2b$10$demo.hash.replace.with.real",
      projects: {
        create: [
          {
            name: "QA Seed Project",
            isPublic: true,
            tasks: {
              create: [
                {
                  name: "Seed Task A",
                  startDate: new Date("2026-02-10T00:00:00Z"),
                  endDate: new Date("2026-02-12T00:00:00Z"),
                  color: "#2bd9a7",
                  position: 0
                },
                {
                  name: "Seed Task B",
                  startDate: new Date("2026-02-13T00:00:00Z"),
                  endDate: new Date("2026-02-16T00:00:00Z"),
                  color: "#5c7cfa",
                  position: 1
                }
              ]
            },
            shareLinks: {
              create: [
                {
                  token: "qa-readonly-token",
                  accessType: "readonly"
                }
              ]
            }
          }
        ]
      }
    },
    include: { projects: true }
  });

  const project = user.projects[0];
  if (!project) return;

  await prisma.projectVersion.createMany({
    data: [
      {
        projectId: project.id,
        versionNumber: 1,
        snapshotData: { note: "QA seed snapshot" },
        createdBy: user.id
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
