// Script to set a user as owner
// Run with: npx tsx scripts/set-owner.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setOwner() {
  const email = 'admin@maalline.com'

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'owner' },
  })

  console.log(`✅ Usuario ${user.email} ahora tiene rol: ${user.role}`)

  await prisma.$disconnect()
}

setOwner().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
