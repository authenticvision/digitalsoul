import { Button } from '@/components/ui'

const Sidebar = ({ contracts, ...props }) => {
	return (
		<aside className="flex flex-col h-[calc(100vh_-_2rem)] w-56 border-r border-raven-700 pt-6">
			{contracts.length ? (
				<span> You have contracts </span>
			) : (
				<div className="flex flex-col justify-around align-center w-full min-h-screen text-center">
					<div className="mb-5">
						It appears that you don't have any contract imported into
						DigitalSoul.
					</div>
					<div className="flex justify-end align-end">
						<Button href="/contracts" text="Import new contract" />
					</div>
				</div>
			)}
		</aside>
	)
}

export default Sidebar
