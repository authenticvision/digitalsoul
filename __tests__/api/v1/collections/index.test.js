import api from '@/pages/api/v1/collections/[csn]/[anchor]'
import { createMocks } from 'node-mocks-http'

import { createTestContext } from '@/__tests__/__helpers'

const ctx = createTestContext()

describe('/api/v1/collections/[csn]/[anchor]', () => {
	it('responds with a 405 if using wrong method', async () => {
		const { req, res } = createMocks({
			method: 'POST',
			query: {
				csn: 'BEEF',
				anchor: '0xCOFFEE'
			}
		})

		await api(req, res)
		const data = await res._getJSONData()

		expect(res.statusCode).toEqual(405)
	})

	it('responds with a 404 if csn does not exist', async () => {
		const { req, res } = createMocks({
			method: 'GET',
			query: {
				csn: 'BEEF',
				anchor: '0xCOFFEE'
			}
		})

		await api(req, res)
		const data = await res._getJSONData()

		expect(res.statusCode).toEqual(404)
		expect(data).toEqual({
			message: 'CSN does not exists on our records'
		})
	})

	it('responds with the name, description and a URL for the primary asset', async () => {
		const wallet = await ctx.db.wallet.create({
			data: {
				address: '0xDEADBEEF'
			}
		})

		const contract = await ctx.db.contract.create({
			data: {
				csn: 'BEEF',
				name: 'Deadbeef',
				address: '0xCONTRACT',
				network: 'local-test',
				settings: {},
				owner: {
					connect: {
						id: wallet.id
					}
				}
			}
		})

		const nft = await ctx.db.NFT.create({
			data: {
				slid: 'TEST',
				anchor: '0xCOFFEE',
				metadata: {
					name: 'Something'
				},
				contract: {
					connect: {
						id: contract.id
					}
				}
			}
		})

		const { req, res } = createMocks({
			method: 'GET',
			query: {
				csn: 'BEEF',
				anchor: '0xCOFFEE'
			}
		})

		await api(req, res)
		const data = await res._getJSONData()

		expect(data).toEqual({
			name: 'Something'
		})
	})
})
