import '@/styles/globals.css'
import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'
import { SessionProvider }  from 'next-auth/react'

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
			<SessionProvider session={pageProps.session}>
				<Component {...pageProps} />
			</SessionProvider>
		</WagmiConfig>
	)
}
