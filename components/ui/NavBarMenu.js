import Link from 'next/link'
import Image from 'next/image'
import walletIcon from '@/public/icons/wallet.svg'

import { useSession, signOut } from 'next-auth/react'
import { useDisconnect } from 'wagmi'

const NavBarMenu = () => {
	const { disconnectAsync } = useDisconnect()
	const { data: session, status } = useSession()

	const onDisconnect = async(e) => {
		e.preventDefault()

		await disconnectAsync()
		signOut()
	}

	return (
		<div className="dropdown dropdown-end">
			<label tabIndex={0} className="btn btn-ghost">
				<div className="w-10 rounded-full">
					<Image src={walletIcon} priority width={60} height={60} />
				</div>
			</label>

			<ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
				{session && (
					<li>
						<Link href="#" className="justify-between">
							Profile
						</Link>
					</li>
				)}

				{session && (
					<li>
						<Link href="#" onClick={onDisconnect}>
							Disconnect
						</Link>
					</li>
				)}
			</ul>
		</div>
	)
}

export default NavBarMenu
