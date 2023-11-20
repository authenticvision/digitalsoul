import { PrismaClient } from '@prisma/client'
import { join } from "path"
import { execSync } from "child_process"
import { Client } from 'pg'
import { nanoid } from 'nanoid'

export function createTestContext() {
	let ctx = {}

	const prismaCtx = prismaTestContext()

	beforeEach(async () => {
		const db = await prismaCtx.before()

		Object.assign(ctx, {
			db
		})
	})

	afterEach(async () => {
		await prismaCtx.after()
	})

	return ctx
}

function prismaTestContext() {
	const prismaBinary = join(__dirname, "..", "node_modules", ".bin", "prisma")
	const schema = `test_${nanoid()}`
	let databaseUrl = ''
	let prismaClient = null

	return {
		async before() {
			// Run the migrations to ensure our schema has the required structure
			databaseUrl = `${process.env.POSTGRESQL_PRISMA_URL}&schema=${schema}`
			process.env.POSTGRESQL_PRISMA_URL = databaseUrl

			execSync(`${prismaBinary} db push --skip-generate --schema=./schema.prisma`, {
				//stdio: 'inherit', XXX: Enable when debugging
				env: {
					...process.env,
					POSTGRESQL_PRISMA_URL: databaseUrl
				}
			})

			// Construct a new Prisma Client connected to the generated schema
			prismaClient = new PrismaClient()

			return prismaClient
		},

		async after() {
			// Drop the schema after the tests have completed
			const client = new Client({
				connectionString: databaseUrl,
			})

			await client.connect()
			await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
			await client.end()

			// Release the Prisma Client connection
			await prismaClient?.$disconnect()
		}
	}
}

