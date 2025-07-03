import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assinfoso.edu.gh' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@assinfoso.edu.gh',
      password: adminPassword,
      role: 'admin',
      isActive: true
    }
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample user
  const userPassword = await bcrypt.hash('user123456', 12);
  const user = await prisma.user.upsert({
    where: { email: 'researcher@assinfoso.edu.gh' },
    update: {},
    create: {
      name: 'Research Assistant',
      email: 'researcher@assinfoso.edu.gh',
      password: userPassword,
      role: 'user',
      isActive: true
    }
  });

  console.log('✅ Created sample user:', user.email);

  // Create sample albums
  const generalAlbum = await prisma.album.upsert({
    where: { name: 'General Research' },
    update: {},
    create: {
      name: 'General Research',
      description: 'General research images and documentation',
      isPrivate: false,
      createdById: admin.id
    }
  });

  const fieldworkAlbum = await prisma.album.upsert({
    where: { name: 'Fieldwork Documentation' },
    update: {},
    create: {
      name: 'Fieldwork Documentation',
      description: 'Photos and documentation from field research',
      isPrivate: false,
      createdById: admin.id
    }
  });

  console.log('✅ Created sample albums');

  // Create sample project
  const project = await prisma.project.create({
    data: {
      name: 'Malaria Vector Control Study',
      description: 'Investigating the effectiveness of bed nets in rural communities',
      status: 'active',
      priority: 'high',
      startDate: new Date('2025-01-01'),
      dueDate: new Date('2025-12-31'),
      createdById: admin.id
    }
  });

  // Add team members to project
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: admin.id, role: 'lead' },
      { projectId: project.id, userId: user.id, role: 'member' }
    ]
  });

  console.log('✅ Created sample project:', project.name);

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Literature Review',
      description: 'Complete comprehensive literature review on vector control methods',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date('2025-02-28'),
      projectId: project.id,
      assignedToId: user.id,
      createdById: admin.id,
      tags: ['research', 'literature', 'priority']
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Field Site Preparation',
      description: 'Prepare field sites and coordinate with local communities',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2025-03-15'),
      projectId: project.id,
      assignedToId: admin.id,
      createdById: admin.id,
      tags: ['fieldwork', 'preparation']
    }
  });

  console.log('✅ Created sample tasks');

  // Create sample calendar events
  const event1 = await prisma.calendarEvent.create({
    data: {
      title: 'Project Kickoff Meeting',
      description: 'Initial team meeting to discuss project goals and timeline',
      startDate: new Date('2025-01-15T10:00:00Z'),
      endDate: new Date('2025-01-15T12:00:00Z'),
      type: 'meeting',
      location: 'Conference Room A',
      projectId: project.id,
      createdById: admin.id,
      attendees: {
        connect: [{ id: admin.id }, { id: user.id }]
      }
    }
  });

  const event2 = await prisma.calendarEvent.create({
    data: {
      title: 'Literature Review Deadline',
      description: 'Final deadline for literature review completion',
      startDate: new Date('2025-02-28T23:59:00Z'),
      endDate: new Date('2025-02-28T23:59:00Z'),
      type: 'deadline',
      projectId: project.id,
      createdById: admin.id,
      attendees: {
        connect: [{ id: user.id }]
      }
    }
  });

  console.log('✅ Created sample calendar events');

  // Create sample invite (pending)
  const invite = await prisma.invite.create({
    data: {
      email: 'newresearcher@assinfoso.edu.gh',
      name: 'New Researcher',
      role: 'user',
      token: 'sample_invite_token_123',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      invitedById: admin.id
    }
  });

  console.log('✅ Created sample invite');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@assinfoso.edu.gh / admin123456');
  console.log('User: researcher@assinfoso.edu.gh / user123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
