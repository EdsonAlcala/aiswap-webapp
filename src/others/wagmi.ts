import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { goerli, arbitrumGoerli, gnosis, arbitrum } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { linea } from './linea'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrumGoerli, goerli, gnosis, arbitrum, linea],
  [
    publicProvider(),
  ],
)

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains, projectId: "AISwap" })
    ],
  },
]);

export const config = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains }
