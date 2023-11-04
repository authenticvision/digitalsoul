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
	// Background
	shark: {
		50: '#f5f7fa',
		100: '#ebeef3',
		200: '#d2d9e5',
		300: '#abbace',
		400: '#7e94b2',
		500: '#5e7799',
		600: '#4a5f7f',
		700: '#3c4c68',
		800: '#354257',
		900: '#303a4a',
		950: '#202632',
	},
	// Headers
	vulcan: {
		50: '#f5f6fa',
		100: '#ebedf3',
		200: '#d2d9e5',
		300: '#aab7cf',
		400: '#7c91b4',
		500: '#5c749b',
		600: '#485c81',
		700: '#3b4b69',
		800: '#344158',
		900: '#2f384b',
		950: '#171b25',
	},
	tuna: {
		50: '#f6f7f9',
		100: '#ebedf3',
		200: '#d3d9e4',
		300: '#acb8cd',
		400: '#7f92b1',
		500: '#5f7498',
		600: '#4b5d7e',
		700: '#3d4b67',
		800: '#354057',
		900: '#29303f',
		950: '#202531',
	},
	raven: {
		50: '#f5f7f8',
		100: '#edf0f2',
		200: '#dfe3e6',
		300: '#cad3d7',
		400: '#b4bdc5',
		500: '#a0aab4',
		600: '#8b93a0',
		700: '#787f8c',
		800: '#626771',
		900: '#52575d',
		950: '#303336',
	},
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
		themes: ["dark"]
	}
}
