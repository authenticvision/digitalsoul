import { formatAddress } from "@/lib/utils"
import solaireButton from '@/public/buttons/Solaire-button-trans-bg.svg'
import Image from 'next/image'
import { Button } from '@/components/ui'


const WalletLoginButton = ({ wallet, ...props}) => (
	<div className="flex items-center overflow-auto w-full font-mono p-2 rounded text-white mt-5">
		<span>
			{wallet?.links?.wallet_login && <a href={wallet.links.wallet_login}><Button><Image src={solaireButton} /></Button></a>}
		</span>			
	</div>
)

export default WalletLoginButton
