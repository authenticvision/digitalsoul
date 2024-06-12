import React from 'react'
import logoImg from '@/public/logo-white.svg'
import Image from 'next/image'
import clsx from 'clsx'

const Logo = ({ size = 'navbar', logoPath=null, ...props }) => {
	const sizes = {
		'navbar': 'h-[60px] w-[60px]',
		'landing': 'h-[200px] w-[200px]'
	}

	const logoContainerClasses = clsx('relative', sizes[size])

	const logoImage = logoPath ? logoPath : logoImg

	return (
		<div className={logoContainerClasses}>
			<Image src={logoImage} fill objectFit='contain' priority alt="MetaAnchor Grey Logo" />
		</div>
	)
}

export default Logo
