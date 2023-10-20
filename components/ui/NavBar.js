import Link from 'next/link'
import { Logo, Button } from '@/components/ui'

import { useSession, signOut } from 'next-auth/react'
import { useDisconnect } from 'wagmi'

const NavBar = ({...props }) => {
	const { disconnectAsync } = useDisconnect()
	const { data: session, status } = useSession()

	const onDisconnect = async(e) => {
		e.preventDefault()

		await disconnectAsync()
		signOut()
	}

	return (
		<div className="navbar bg-base-100">
			<div className="flex-1">
				<Link href="/" className="pl-5 normal-case text-xl flex">
					<Logo size="navbar" />
				</Link>
			</div>

			<div className="flex-none">
				<ul className="menu menu-horizontal px-1">
					<li>
						{session ? (
							<Link href="#" onClick={onDisconnect}>
								Disconnect
							</Link>
						) : (
							<Link href="/auth">Connect</Link>
						)}
					</li>
					{session && (
					<li>
						<Link href="#">Config</Link>
					</li>
					)}
				</ul>
			</div>
		</div>
	)
}

export default NavBar
