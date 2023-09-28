import NextAuth from 'next-auth'
import { utils } from 'ethers'
import CredentialsProvider from 'next-auth/providers/credentials'

const walletURL = `${process.env.HOST_URL}/api/wallets`

export default NextAuth({
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				address: {
					label: 'Address',
					type: 'text',
					placeholder: '0x0',
				},
			},
			async authorize(credentials) {
				//if (!Boolean(utils.getAddress(credentials?.address))) {
				//	return null
				//}

				try {
					const body = {
						address: credentials.address
					}

					const res = await fetch(walletURL, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(body),
					})

					const { wallet } = await res.json()

					if (res.ok) {
						return { id: wallet.address }
					}
				} catch (error) {
					// TODO: Add to some error collecting service
					console.error(error)

					return null
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	jwt: {
		secret: process.env.JWT_SECRET,
	},
	callbacks: {
		async session({ session, token }) {
			session.address = token.sub

			return session
		},
	},
	secret: process.env.NEXT_AUTH_SECRET,
	pages: {
		signIn: '/',
		signOut: '/',
		error: '/',
		newUser: '/',
	},
})
