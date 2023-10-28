import clsx from 'clsx'

export function formatAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(38, 42)}`
}

export function cn(...inputs) {
	return clsx(inputs)
}
