import React from 'react'
import Link from 'next/link'

const Button = ({ btnType, text, onClick, href, style, className, disabled }) => {
	const rootClassName = `relative inline-flex items-center justify-center cursor
pointer no-underline px-3.5 rounded-md font-medium outline-0 select-none align-middle
whitespace-no-wrap border border-solid bg-success border-success-dark hover:bg-success/90`
	return (
		<Link className='no-text-decoration w-full' href={href || ""}>
			<button type={btnType}
					className={`text-background shadow-[0_5px_10px_rgb(0,68,255,0.12)] h-10 leading-10 text-[15px] ${rootClassName}`}
					disabled={disabled}
					onClick={onClick}>
				{text && (
					<span>{text}</span>
				)}
			</button>
		</Link>
	)
}

export default Button
