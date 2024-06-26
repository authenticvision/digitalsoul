import axios from 'axios'

export default class MetaAnchor {
	constructor(config = {}) {
		this.configuration = {
			baseUrl: config.baseUrl || process.env.METAANCHOR_API_URL,
			apiKey: config.apiKey || process.env.METAANCHOR_API_TOKEN,
			verbose: config.verbose
		}

		this.api = axios.create({
			baseURL: this.configuration.baseUrl,
			headers: {
				'Authorization': `Bearer ${this.configuration.apiKey}`
			}
		})
	}

	async sendRequest(endpoint, queryParams, body, method) {
		const { baseUrl, apiKey } = this.configuration
		const auth = `Bearer ${apiKey}`

		const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': auth
		}

		const reqBody = body ?? JSON.stringify(body)

		try {
			const response = await fetch(`${baseUrl}${endpoint}`, {
				method,
				headers,
				body: reqBody
			})

			const responseData = await response.json()

			return responseData
		} catch (e) {
			console.error(e)

			throw e
		}
	}

	async getAnchors(csn) {
		const { status, data } = await this.api.get(`/contract/${csn}/anchors`)

		return { data: data['anchors'], status, rawData: data }
	}

	async getContracts(walletId) {
		const { status, data } = await this.api.get(`/wallet/${walletId}/contracts`)

		return { data: data['contracts'], status }
	}

	async claimContract(csn, signedMessage) {
		const { data, status } = await this.api.post(`/contract/${csn}/claim`, {
			authorization: signedMessage
		})

		return { data, status }
	}

	async claimNFT(attestationToken, walletAddress) {
		const { data, status } = await this.api.post(`/anchor/drop`, {
			attestation: attestationToken,
			beneficiary: walletAddress
		})

		return { data, status }
	}

	async getAssetData(anchor) {
		const { status, data } = await this.api.get(`/anchor/${anchor}/asset`)
		return {data, status}		
	}

	async getAssetByAttestation(attestationToken) {
		const { status, data } = await this.api.get(`/anchor/asset-by-attestation/${attestationToken}`)

		return { data, status }
	}

	async verifyOwner(attestationToken, walletAddress) {
		const { data, status } = await this.api.post(`/anchor/verify-owner`, {
			attestation: attestationToken,
			wallet: walletAddress
		})

		return { data, status }
	}
}
