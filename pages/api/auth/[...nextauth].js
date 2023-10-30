import NextAuth from 'next-auth'
import { ethers } from 'ethers'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'

export const authOptions = {
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
				if (!Boolean(ethers.getAddress(credentials?.address))) {
					return null
				}

				// TODO: We need to figure it out a nice mechanism to check if
				// someone is allowed to authenticate. I suppose its planned to
				// allow the owner of the instance to disable registration
				const wallet = await prisma.wallet.upsert({
					where: {
						address: credentials.address
					},
					create: {
						address: credentials.address
					},
					update: {},
				})

				return { id: wallet.address }
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
		async jwt({ token, account, profile }) {
			if (account) {
				token.wallet = await prisma.wallet.findFirst({
					where: {
						address: token.sub
					}
				})
			}

			return token
		},
		async session({ session, token, user }) {
			session.address = token.sub
			session.user.name = token.sub
			session.wallet = token.wallet

			return session
		}
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: '/',
		signOut: '/',
		error: '/',
		newUser: '/',
	},
}

export default NextAuth(authOptions)
