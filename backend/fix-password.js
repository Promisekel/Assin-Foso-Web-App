import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    // Hash the password with the same rounds as the login expects
    const newHash = await bcrypt.hash('admin123456', 12);
    
    // Update admin user
    const admin = await prisma.user.update({
      where: { email: 'admin@assinfoso.edu.gh' },
      data: { password: newHash }
    });
    
    console.log('✅ Updated admin password');
    
    // Update regular user too
    const userHash = await bcrypt.hash('user123456', 12);
    const user = await prisma.user.update({
      where: { email: 'researcher@assinfoso.edu.gh' },
      data: { password: userHash }
    });
    
    console.log('✅ Updated user password');
    
    // Test the password
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@assinfoso.edu.gh' }
    });
    
    const isValid = await bcrypt.compare('admin123456', testUser.password);
    console.log('🔐 Password test:', isValid ? 'VALID' : 'INVALID');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
