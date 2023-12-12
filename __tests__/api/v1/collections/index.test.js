/**
 * @jest-environment @quramy/jest-prisma/environment
 */

import prisma from '@/lib/prisma'

import api from '@/pages/api/v1/collections/[csn]/[anchor]'
import { createMocks } from 'node-mocks-http'

describe('/api/v1/collections/[csn]/[anchor]', () => {
	it('responds with a 405 if using wrong method', async () => {
		const { req, res } = createMocks({
			method: 'POST',
			query: {
				csn: 'BEEF',
				anchor: '0x505def45449ab0da5a5d58456298c4e2634c698cccc30f6259e3c6695c664731'
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
				anchor: '0x505def45449ab0da5a5d58456298c4e2634c698cccc30f6259e3c6695c664731'
			}
		})

		await api(req, res)
		const data = await res._getJSONData()

		expect(res.statusCode).toEqual(404)
		expect(data).toEqual({
			message: 'CSN does not exists on our records'
		})
	})

	it('responds with the name, description based on contract settings', async () => {
		const wallet = await prisma.wallet.create({
			data: {
				address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // this is the first hardhat testing wallet
			}
		})

		const contract = await prisma.contract.create({
			data: {
				csn: 'BEEF',
				name: 'Deadbeef',
				address: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
				network: 'local-test',
				settings: {
					NFT_NAME: "DigitalSoul [ANCHOR_SHORT]", // Tests the contract-wise settings including Variables
					NFT_DESCRIPTION: "Contract is deployed at [CONTRACT_ADDRESS] as '[COLLECTION_NAME]'" //
				},
				owner: {
					connect: {
						id: wallet.id
					}
				}
			}
		})

		const nft = await prisma.NFT.create({
			data: {
				slid: 'TEST',
				anchor: '0x505def45449ab0da5a5d58456298c4e2634c698cccc30f6259e3c6695c664731',
				metadata: {
					"some": "value"
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
				anchor: '0x505def45449ab0da5a5d58456298c4e2634c698cccc30f6259e3c6695c664731'
			}
		})

		await api(req, res)
		const data = await res._getJSONData()

		expect(data).toEqual({
			name: 'DigitalSoul 0x505d…4731',
			description: "Contract is deployed at 0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF as 'Deadbeef'",
			some: "value"
		})
	})

	describe('private data', () => {
		it('replaces variable with empty string when private data is not set', async () => {
			const wallet = await prisma.wallet.create({
				data: {
					address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // this is the first hardhat testing wallet
				}
			})

			const contract = await prisma.contract.create({
				data: {
					csn: 'BEEF',
					name: 'Deadbeef',
					address: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
					network: 'local-test',
					settings: {
						NFT_NAME: "DigitalSoul #[MY_PRIVATE_VALUE]", // Tests the contract-wise settings including Variables
						NFT_DESCRIPTION: "Contract is deployed at [CONTRACT_ADDRESS] as '[COLLECTION_NAME]'" //
					},
					owner: {
						connect: {
							id: wallet.id
						}
					}
				}
			})

			const nft = await prisma.NFT.create({
				data: {
					slid: 'TEST',
					anchor: '0x505def45449ab0da5a5d58456298c4e2634c698cccc30f6259e3c6695c664731',
					metadata: {
						"some": "value",
						"attributes": [{
							"type": "SuperFancy",
							"value": "[MY_PRIVATE_VALUE]"
						}],
						"an_array": ["PRESERVE_THIS"] // This is NOT a variable and needs to stay untouched preserved
					},
					privateData: {
						"something-else": "002"
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
					anchor: '0x505def45449ab0da5a5d58456298c4e2634c698cccc30f6259e3c6695c664731'
				}
			})

			await api(req, res)
			const data = await res._getJSONData()

			expect(data).toEqual({
				name: 'DigitalSoul #',
				description: "Contract is deployed at 0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF as 'Deadbeef'",
				some: "value",
				an_array: ["PRESERVE_THIS"],
				attributes: [{
					type: "SuperFancy",
					value: ""
				}]
			})
		})

		it('responds with replaced nft.private_data variables', async () => {
			const wallet = await prisma.wallet.create({
				data: {
					address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // this is the first hardhat testing wallet
				}
			})

			const contract = await prisma.contract.create({
				data: {
					csn: 'BEEF',
					name: 'Deadbeef',
					address: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
					network: 'local-test',
					settings: {
						NFT_NAME: "DigitalSoul #[MY_PRIVATE_VALUE]", // Tests the contract-wise settings including Variables
						NFT_DESCRIPTION: "Contract is deployed at [CONTRACT_ADDRESS] as '[COLLECTION_NAME]'" //
					},
					owner: {
						connect: {
							id: wallet.id
						}
					}
				}
			})

			const nft = await prisma.NFT.create({
				data: {
					slid: 'TEST',
					anchor: '0x505def45449ab0da5a5d58456298c4e2634c698cccc30f6259e3c6695c664731',
					metadata: {
						"some": "value",
						"attributes": [{
							"type": "SuperFancy",
							"value": "[MY_PRIVATE_VALUE]"
						}]
					},
					privateData: {
						"my_private_value": "002"
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
					anchor: '0x505def45449ab0da5a5d58456298c4e2634c698cccc30f6259e3c6695c664731'
				}
			})

			await api(req, res)
			const data = await res._getJSONData()

			expect(data).toEqual({
				name: 'DigitalSoul #002',
				description: "Contract is deployed at 0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF as 'Deadbeef'",
				some: "value",
				attributes: [{
					type: "SuperFancy",
					value: "002"
				}]
			})
		})
	})
})
