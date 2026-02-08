import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      passwordHash: "$2b$10$demo.hash.replace.with.real",
      projects: {
        create: [
          {
            name: "Launch Plan",
            isPublic: true,
            tasks: {
              create: [
                {
                  name: "Research",
                  startDate: new Date("2026-02-10"),
                  endDate: new Date("2026-02-14"),
                  color: "#2bd9a7",
                  position: 1
                },
                {
                  name: "Design",
                  startDate: new Date("2026-02-15"),
                  endDate: new Date("2026-02-22"),
                  color: "#5c7cfa",
                  position: 2
                },
                {
                  name: "Build",
                  startDate: new Date("2026-02-23"),
                  endDate: new Date("2026-03-10"),
                  color: "#ff7a59",
                  position: 3
                }
              ]
            },
            shareLinks: {
              create: [
                {
                  token: "demo-readonly-token",
                  accessType: "readonly"
                }
              ]
            }
          }
        ]
      }
    },
    include: {
      projects: true
    }
  });

  const project = user.projects[0];
  if (!project) {
    return;
  }

  await prisma.projectVersion.createMany({
    data: [
      {
        projectId: project.id,
        versionNumber: 1,
        snapshotData: { note: "Initial snapshot" },
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
