import { formatAddress } from "@/lib/utils";
import WrenchIcon from '@heroicons/react/24/outline/WrenchIcon'
import solaireButton from '@/public/buttons/Solaire-logo-only.svg'
import Image from 'next/image'


const Wallet = ({ wallet, handleWalletChange, ...props }) => {
	const walletKnown = wallet?.id ? true : false;
  return (
		<div className="dropdown dropdown-end">
			<label tabIndex={0} className="btn btn-ghost w-64">
				<div>
					{!walletKnown && <a href="#" onClick={handleWalletChange}>login</a>}
					{wallet?.wallet_type === "EOA" && <span>{formatAddress(wallet.address)}</span>}
					{(wallet?.wallet_type === "EMAIL" || wallet?.wallet_type === "SOLAIRE" || wallet?.wallet_type === "UNAVAILABLE") && <span>{wallet.id}</span>}
				</div>
			</label>
			<ul tabIndex={0} className="dropdown-content menu menu-sm mt-3 z-[1] p-2 shadow rounded-box">
				{(wallet?.links?.wallet_login && <li><a href={wallet.links.wallet_login}><Image alt="Solaire Logo" className="h-4 w-4 mr-2" src={solaireButton} />Connect Solaire Wallet</a></li>)}
				{( walletKnown && <li><a onClick={handleWalletChange}><WrenchIcon className="h-4 w-4 mr-2"/>Change Wallet</a></li> )}
			</ul>
		</div>
  );
};

export default Wallet;