import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixResearcherEmail() {
  try {
    console.log('🔧 Fixing researcher email...');
    
    // Find researcher user with hyphen
    const researcherWithHyphen = await prisma.user.findUnique({
      where: { email: 'researcher@assinfoso-kccr.edu.gh' }
    });
    
    if (researcherWithHyphen) {
      console.log('✅ Found researcher with hyphen, updating email...');
      
      // Update to email without hyphen
      const updatedResearcher = await prisma.user.update({
        where: { id: researcherWithHyphen.id },
        data: { 
          email: 'researcher@assinfoso.edu.gh',
          password: await bcrypt.hash('user123456', 12)
        }
      });
      
      console.log('✅ Updated researcher email to:', updatedResearcher.email);
    } else {
      console.log('Creating researcher user...');
      
      const userPassword = await bcrypt.hash('user123456', 12);
      const user = await prisma.user.upsert({
        where: { email: 'researcher@assinfoso.edu.gh' },
        update: {
          password: userPassword,
          role: 'user',
          isActive: true
        },
        create: {
          name: 'Research Assistant',
          email: 'researcher@assinfoso.edu.gh',
          password: userPassword,
          role: 'user',
          isActive: true
        }
      });
      
      console.log('✅ Created/updated researcher:', user.email);
    }
    
    // Test the password
    const testUser = await prisma.user.findUnique({
      where: { email: 'researcher@assinfoso.edu.gh' }
    });
    
    if (testUser) {
      const isValid = await bcrypt.compare('user123456', testUser.password);
      console.log('🔐 Password test for researcher@assinfoso.edu.gh:', isValid ? 'VALID' : 'INVALID');
    }
    
    console.log('🎉 Researcher email fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixResearcherEmail();
