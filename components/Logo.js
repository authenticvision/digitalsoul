import React from 'react'
import logoImg from '@/public/logo-grey.svg'
import Image from 'next/image'

const Logo = (props) => (
	<Image src={logoImg} priority alt="MetaAnchor Grey Logo" />
)

export default Logo
