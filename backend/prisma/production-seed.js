import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seed...');

  // Create REAL admin user for Assin Foso KCCR
  const adminPassword = await bcrypt.hash('AssinfosKCCR2025!Admin', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assinfoso-kccr.edu.gh' },
    update: {},
    create: {
      name: 'KCCR Research Administrator',
      email: 'admin@assinfoso-kccr.edu.gh',
      password: adminPassword,
      role: 'admin',
      isActive: true
    }
  });

  console.log('✅ Created admin user:', admin.email);

  // Create REAL research user
  const researcherPassword = await bcrypt.hash('Researcher2025!KCCR', 12);
  const researcher = await prisma.user.upsert({
    where: { email: 'researcher@assinfoso-kccr.edu.gh' },
    update: {},
    create: {
      name: 'Research Assistant',
      email: 'researcher@assinfoso-kccr.edu.gh',
      password: researcherPassword,
      role: 'user',
      isActive: true
    }
  });

  console.log('✅ Created researcher user:', researcher.email);

  // Create REAL research albums
  const fieldWorkAlbum = await prisma.album.upsert({
    where: { name: 'Field Research Documentation' },
    update: {},
    create: {
      name: 'Field Research Documentation',
      description: 'Documentation of field research activities, data collection, and community engagement in Assin Foso region',
      isPrivate: false,
      createdById: admin.id
    }
  });

  const laboratoryAlbum = await prisma.album.upsert({
    where: { name: 'Laboratory Research' },
    update: {},
    create: {
      name: 'Laboratory Research',
      description: 'Laboratory procedures, equipment, sample processing, and research findings',
      isPrivate: false,
      createdById: admin.id
    }
  });

  const surveillanceAlbum = await prisma.album.upsert({
    where: { name: 'Disease Surveillance' },
    update: {},
    create: {
      name: 'Disease Surveillance',
      description: 'Infectious disease surveillance activities, monitoring, and epidemiological investigations',
      isPrivate: false,
      createdById: admin.id
    }
  });

  const outreachAlbum = await prisma.album.upsert({
    where: { name: 'Community Outreach' },
    update: {},
    create: {
      name: 'Community Outreach',
      description: 'Community engagement, health education, and public health outreach programs',
      isPrivate: false,
      createdById: admin.id
    }
  });

  const publicationsAlbum = await prisma.album.upsert({
    where: { name: 'Publications & Conferences' },
    update: {},
    create: {
      name: 'Publications & Conferences',
      description: 'Research publications, conference presentations, and scientific dissemination',
      isPrivate: false,
      createdById: admin.id
    }
  });

  console.log('✅ Created research albums');

  // Create REAL research project
  const mainProject = await prisma.project.create({
    data: {
      name: 'Infectious Disease Epidemiology Research Program',
      description: 'Comprehensive infectious disease surveillance and epidemiological research in the Assin Foso catchment area, focusing on vector-borne diseases, respiratory infections, and emerging health threats.',
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2025-12-31'),
      createdById: admin.id
    }
  });

  console.log('✅ Created main research project:', mainProject.name);

  // Add project member
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: mainProject.id,
        userId: researcher.id
      }
    },
    update: {},
    create: {
      projectId: mainProject.id,
      userId: researcher.id,
      role: 'MEMBER'
    }
  });

  // Create REAL research tasks
  const tasks = [
    {
      title: 'Disease Surveillance System Setup',
      description: 'Establish comprehensive disease surveillance system for infectious disease monitoring in the Assin Foso region',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: mainProject.id,
      assignedToId: researcher.id,
      createdById: admin.id,
      dueDate: new Date('2025-03-31')
    },
    {
      title: 'Community Health Assessment',
      description: 'Conduct baseline community health assessment to identify disease patterns and risk factors',
      status: 'TODO',
      priority: 'HIGH',
      projectId: mainProject.id,
      assignedToId: researcher.id,
      createdById: admin.id,
      dueDate: new Date('2025-06-30')
    },
    {
      title: 'Vector Control Research',
      description: 'Research and implement vector control strategies for malaria and other vector-borne diseases',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: mainProject.id,
      assignedToId: researcher.id,
      createdById: admin.id,
      dueDate: new Date('2025-09-30')
    }
  ];

  for (const taskData of tasks) {
    await prisma.task.create({
      data: taskData
    });
  }

  console.log('✅ Created research tasks');

  // Create sample calendar events
  const events = [
    {
      title: 'Weekly Research Team Meeting',
      description: 'Regular team meeting to discuss research progress and findings',
      startDate: new Date('2025-07-07T09:00:00Z'),
      endDate: new Date('2025-07-07T10:00:00Z'),
      isAllDay: false,
      projectId: mainProject.id,
      createdById: admin.id
    },
    {
      title: 'Community Health Screening',
      description: 'Community-wide health screening and disease surveillance activity',
      startDate: new Date('2025-07-15T08:00:00Z'),
      endDate: new Date('2025-07-15T17:00:00Z'),
      isAllDay: true,
      projectId: mainProject.id,
      createdById: admin.id
    }
  ];

  for (const eventData of events) {
    await prisma.calendarEvent.create({
      data: eventData
    });
  }

  console.log('✅ Created calendar events');

  console.log('🎉 Production database seeded successfully!');
  console.log('\n📋 PRODUCTION CREDENTIALS:');
  console.log('👤 Admin: admin@assinfoso-kccr.edu.gh / AssinfosKCCR2025!Admin');
  console.log('👤 Researcher: researcher@assinfoso-kccr.edu.gh / Researcher2025!KCCR');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
