import Link from 'next/link'
import Image from 'next/image'
import walletIcon from '@/public/icons/wallet.svg'

import { useSession, signOut } from 'next-auth/react'
import { useDisconnect } from 'wagmi'

import { formatAddress } from '@/lib/utils'

const NavBarMenu = () => {
	const { disconnectAsync } = useDisconnect()
	const { data: session, status } = useSession()

	return (
		<div className="dropdown dropdown-end">
			<label tabIndex={0} className="btn btn-ghost">
				<div className="w-10 rounded-full">
					<Image src={walletIcon} priority width={60} height={60} />
				</div>
			</label>

			<ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-shark-800 rounded-box w-64">
				{session && (
					<li>
						<Link href="#" className="justify-between">
							Profile
						</Link>
					</li>
				)}

				{session && (
					<li>
						<Link href="/logout">
							Disconnect
						</Link>
					</li>
				)}

				<li className="btn-disabled text-gray-500 mt-2">
					<span>
						Connected with {formatAddress(session.address)}
					</span>
				</li>
			</ul>
		</div>
	)
}

export default NavBarMenu
