import '@/styles/globals.css'
import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient, webSocketPublicClient } = configureChains(
	[mainnet],
	[publicProvider()]
)

const config = createConfig({
	autoConnect: true,
	connectors: [
		new MetaMaskConnector({ chains }),
	],
	publicClient,
	webSocketPublicClient,
})

export default function App({ Component, pageProps }) {
	return (
		<WagmiConfig config={config}>
			<Component {...pageProps} />
		</WagmiConfig>
	)
}
