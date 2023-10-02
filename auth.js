import { getServerSession } from 'next-auth'
import { authOptions } from 'pages/api/auth/[...nextauth]'

// Use it in server contexts
export async function auth(req, res) {
	return await getServerSession(req, res, authOptions)
}

