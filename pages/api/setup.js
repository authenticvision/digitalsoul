import prisma from '@/lib/prisma'


export default async function handle(req, res) {
	const { apiKey } = req.body

	const result = await prisma.config.create({
		data: {
			apiKey
		}
	})

	res.json(result);
}
