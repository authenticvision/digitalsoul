export function formatAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(38, 42)}`
}
