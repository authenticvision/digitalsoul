import { NavBar, Sidebar } from '@/components/ui'

const AppLayout = (props) => {
	const onSelectContract = (event) => {
		props.onChange(event)
	}

	return (
		<div className="mx-auto min-h-screen flex flex-col bg-shark-950 text-white">
			<div>
				<NavBar />
			</div>

			<div className="grid grid-cols-[auto_1fr] justify-center w-full gap-4">
				<Sidebar address={props.wallet.address} contractId={props.contractId}
						 onChange={onSelectContract} />

				<div className="flex pt-6">
					{props.children}
				</div>
			</div>

			<footer className="py-10 w-full mt-auto border-t border-raven-700 flex items-center justify-center text-white bg-shark-950 z-20">
				<span className="text-white mr-1">Created by</span>
				<a
					href="https://authenticvision.com"
					aria-label="AuthenticVision Link"
					target="_blank"
					rel="noreferrer"
					className="text-white link link-hover"
				>
					AuthenticVision
				</a>
			</footer>
		</div>
	)
}

export default AppLayout
