import React from 'react'
import { cn } from '@/lib/utils'

const Button = ({ btnType, children, style, onClick, text, className, variant = '', disabled }) => {
	const rootClassName = cn(
		'btn',
		variant,
		className
	)

	return (
		<button type={btnType}
				className={rootClassName}
				disabled={disabled}
				onClick={onClick} style={style}>
			{text && (
				text
			)}

			{children}
		</button>
	)
}

export default Button
