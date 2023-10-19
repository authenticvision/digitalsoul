const WalletAddress = ({ address, ...props}) => (
	<div className="flex items-center overflow-auto w-full font-mono bg-[#505157] p-2 rounded text-white mt-5">
		<span>
			{address}
		</span>
	</div>
)

export default WalletAddress
