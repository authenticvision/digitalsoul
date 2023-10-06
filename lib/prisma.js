import { PrismaClient } from '@prisma/client'

let prisma

// TODO: Harden this wrapper client
if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient()
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient()
	}

	prisma = global.prisma
}

export default prisma
