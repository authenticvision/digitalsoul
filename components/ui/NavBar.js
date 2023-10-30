import Link from 'next/link'
import Image from 'next/image'
import { Logo, Button, NavBarMenu } from '@/components/ui'
import walletIcon from '@/public/icons/wallet.svg'

import { useSession, signOut } from 'next-auth/react'
import { useDisconnect } from 'wagmi'

const NavBar = ({...props }) => {
	const { data: session, status } = useSession()

	return (
		<div className="navbar bg-[#171b25] shadow-lg">
			<div className="flex-1">
				<Link href="/" className="pl-5 normal-case text-xl flex">
					<Logo size="navbar" />
				</Link>
			</div>

			<div className="flex-none">
				{session ? (
					<NavBarMenu />
				) : (
					<Link href="/auth" className="btn btn-ghost">
						<Image src={walletIcon} priority height={40} width={40} />
					</Link>
				)}
			</div>
		</div>
	)
}

export default NavBar
