import Link from 'next/link'
import { Logo, Button } from '@/components/ui'

import { useSession, signOut } from 'next-auth/react'

const NavBar = ({...props }) => {
	const { data: session, status } = useSession()

	const onDisconnect = async() => {
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
							<Button text="Disconnect"
								onClick={onDisconnect} />
						) : (
							<Link href="/auth">Connect</Link>
						)}</a>
					</li>
					<li>
						<details>
							<summary>
								Parent
							</summary>
							<ul className="p-2 bg-base-100">
								<li><a>Link 1</a></li>
								<li><a>Link 2</a></li>
							</ul>
						</details>
					</li>
				</ul>
			</div>
		</div>
	)
}

export default NavBar
