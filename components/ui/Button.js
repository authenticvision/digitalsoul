import React from 'react'
import { cn } from '@/lib/utils'

const Button = ({ btnType, children, style, onClick, text, className, variant = '', disabled, hidden=false }) => {
	const rootClassName = cn(
		'btn',
		variant,
		className
	)

	return !hidden && (
		<button type={btnType}
				className={rootClassName}
				disabled={disabled}
				visibility="hidden"
				onClick={onClick} style={style}>
			{text && (
				text
			)}

			{children}
		</button>
	)
}

export default Button
