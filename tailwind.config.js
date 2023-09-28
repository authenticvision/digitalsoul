/** @type {import('tailwindcss').Config} */

const colors = {
	success: {
		DEFAULT: '#0070f3',
		dark: '#0761d1',
		light: '#3291ff',
		lighter: '#d3e5ff',
	},
	error: {
		DEFAULT: '#e00',
		dark: '#c50000',
		light: '#ff1a1a',
		lighter: '#f7d4d6',
	},
	warning: {
		DEFAULT: '#f5a623',
		dark: '#ab570a',
		light: '#f7b955',
		lighter: '#ffefcf',
	},
	foreground: '#111',
	background: '#fff'
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
	plugins: [],
}
