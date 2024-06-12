import React from 'react'
import { cn } from '@/lib/utils'

const Button = ({ type, children, style, onClick, text, className, variant = '', disabled, hidden=false }) => {


	return !hidden && (
		<button type={type}
				className={className || "btn btn-ghost"}
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
