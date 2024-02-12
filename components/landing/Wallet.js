import { formatAddress } from "@/lib/utils"

const Wallet = ({ wallet, ...props}) => (
	<div className="flex items-center overflow-auto w-full font-mono bg-[#505157] p-2 rounded text-white mt-5">
		<span>
			{wallet.id} {wallet.wallet_type != "EOA" && <span>({formatAddress(wallet.address)})</span>}
		</span>			
	</div>
)

export default Wallet
