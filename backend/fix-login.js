import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createProductionUsers() {
  try {
    console.log('🔧 Setting up PRODUCTION users for Assin Foso KCCR...');
    
    // Delete data in correct order to respect foreign key constraints
    await prisma.task.deleteMany({});
    await prisma.calendarEvent.deleteMany({});
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.image.deleteMany({});
    await prisma.album.deleteMany({});
    await prisma.invite.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Cleared existing data');
    
    // Create REAL production admin user
    const adminPassword = await bcrypt.hash('AssinfosKCCR2025!Admin', 12);
    const admin = await prisma.user.create({
      data: {
        name: 'Dr. Samuel Kwame Asiedu',
        email: 'admin@assinfoso-kccr.edu.gh',
        password: adminPassword,
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Created production admin user:', admin.email);
    
    // Create research coordinator
    const coordinatorPassword = await bcrypt.hash('ResearchCoord2025!', 12);
    const coordinator = await prisma.user.create({
      data: {
        name: 'Dr. Akosua Mensah',
        email: 'coordinator@assinfoso-kccr.edu.gh',
        password: coordinatorPassword,
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Created research coordinator:', coordinator.email);
    
    // Create field researcher
    const researcherPassword = await bcrypt.hash('FieldWork2025!', 12);
    const researcher = await prisma.user.create({
      data: {
        name: 'Emmanuel Osei',
        email: 'researcher@assinfoso-kccr.edu.gh',
        password: researcherPassword,
        role: 'user',
        isActive: true
      }
    });
    
    console.log('✅ Created field researcher:', researcher.email);
    
    // Create lab technician
    const labTechPassword = await bcrypt.hash('LabTech2025!', 12);
    const labTech = await prisma.user.create({
      data: {
        name: 'Grace Amponsah',
        email: 'labtech@assinfoso-kccr.edu.gh',
        password: labTechPassword,
        role: 'user',
        isActive: true
      }
    });
    
    console.log('✅ Created lab technician:', labTech.email);
    
    // Test admin login
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@assinfoso-kccr.edu.gh' }
    });
    
    if (testUser) {
      const isValid = await bcrypt.compare('AssinfosKCCR2025!Admin', testUser.password);
      console.log('🔐 Admin password test:', isValid ? 'VALID' : 'INVALID');
    }
    
    console.log('\n🎉 PRODUCTION USERS CREATED SUCCESSFULLY!');
    console.log('\n📋 PRODUCTION LOGIN CREDENTIALS:');
    console.log('👨‍⚕️ Admin: admin@assinfoso-kccr.edu.gh / AssinfosKCCR2025!Admin');
    console.log('👩‍🔬 Coordinator: coordinator@assinfoso-kccr.edu.gh / ResearchCoord2025!');
    console.log('👨‍🔬 Researcher: researcher@assinfoso-kccr.edu.gh / FieldWork2025!');
    console.log('👩‍🔬 Lab Tech: labtech@assinfoso-kccr.edu.gh / LabTech2025!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProductionUsers();
