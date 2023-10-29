import React, { useState } from 'react'

import Image from 'next/image'
import { Button } from '@/components/ui'
import viewCardIcon from '@/public/icons/view-image.svg'
import viewTableIcon from '@/public/icons/view-table.svg'

const Header = ({ mode, onChangeMode, contractName, ...props }) => {

	const activeStyle = {
		fill: 'white'
	}
	// TODO: Paint this SVG when active. We might need to install SVGR to do
	// that which is a bit off-scope at this exact moment
	const ViewCard = () => (<Image style={activeStyle} src={viewCardIcon} width={25} height={25} />)
	const ViewTable = () => (<Image style={activeStyle} src={viewTableIcon} width={25} height={25} />)

	return (
		<div className="flex flex-row justify-between items-center w-full pl-8 pb-8">
			<div className="flex flex-col items-start">
				<div className="text-gray-400 text-sm font-normal">
					{contractName}
				</div>

				<div className="font-bold text-4xl">
					My NFTs
				</div>
			</div>

			<div className="flex">
				<div className="join">
					<button className="btn join-item text-white fill-inherit"
						onClick={() => onChangeMode('card')}>
						<ViewCard />
					</button>

					<button className="btn join-item"
						onClick={() => onChangeMode('table')}>
						<ViewTable />
					</button>
				</div>
			</div>

			<div className="flex">
				Third
			</div>
		</div>
	)
}

export default Header
