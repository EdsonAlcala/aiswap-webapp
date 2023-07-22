import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, ...(process.env.NODE_ENV === 'development' ? [] : [])],
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