import React from 'react'
import logoImg from '@/public/logo-grey.svg'
import Image from 'next/image'
import clsx from 'clsx'

const Logo = ({ size = 'navbar', ...props }) => {
	const sizes = {
		'navbar': 'h-[60px] w-[60px]'
	}

	const logoContainerClasses = clsx('relative', sizes[size])

	return (
		<div className={logoContainerClasses}>
			<Image src={logoImg} fill objectFit='contain' priority alt="MetaAnchor Grey Logo" />
		</div>
	)
}

export default Logo
