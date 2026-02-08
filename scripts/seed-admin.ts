import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'admin@maalline.com'
  const password = 'Admin123!'
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  
  if (existingUser) {
    console.log('Admin user already exists:', email)
    return
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)
  
  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Admin',
      lastName: 'MAAL',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    }
  })
  
  console.log('Admin user created!')
  console.log('Email:', email)
  console.log('Password:', password)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
