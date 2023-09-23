import React from 'react'

const Button = ({ btnType, text, onClick, href, style, className, disabled }) => (
	<a className='no-text-decoration' href={href}>
		<button type={btnType}
				className={`py-4 px-8 bg-slate-900 cursor-pointer w-full ${className}`}
				disabled={disabled}
				onClick={onClick}>
			{text && (
				<span>{text}</span>
			)}
		</button>
	</a>
)

export default Button
