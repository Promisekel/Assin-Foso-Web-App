import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testUser() {
  try {
    // Find the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@assinfoso.edu.gh' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    
    // Test password
    const testPassword = 'admin123456';
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('🔐 Password test:', isValid ? 'VALID' : 'INVALID');
    
    if (!isValid) {
      // Create new hash for comparison
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('🔑 Current hash:', user.password);
      console.log('🔑 New hash:', newHash);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUser();
