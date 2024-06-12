/** @type {import('tailwindcss').Config} */

const colors = {
	
}

module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				...colors,
			},
			fontFamily: {
				sans: [
					'-apple-system',
					'system-ui',
					'BlinkMacSystemFont',
					'Helvetica Neue',
					'Helvetica',
					'sans-serif',
				],
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic':
				'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
		},
	},
	plugins: [require('daisyui')],

	daisyui: {
		themes: [{
			"digitalSoul" : {
				"primary": "#3c4c68",			  
				"secondary": "#4a5f7f",			  
				"accent": "#abbace",			  
				"neutral": "#354257",			  
				"base-100": "#202632",
				"info": "#cccccc",	  
				"success": "#00f370",			  
				"warning": "#f5a623",			  
				"error": "#ee0000",
				}
		}]
	}
}
