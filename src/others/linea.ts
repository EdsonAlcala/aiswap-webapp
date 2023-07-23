import { Chain } from '@wagmi/core'

export const linea = {
    id: 59144,
    name: 'Linea',
    network: 'linea',
    nativeCurrency: {
        decimals: 18,
        name: 'Ethereum',
        symbol: 'ETH',
    },
    rpcUrls: {
        public: { http: ['https://rpc.linea.build'] },
        default: { http: ['https://linea-mainnet.infura.io/v3/2b012ac0c43248068dc685ee6d0c30e1'] },
    },
    blockExplorers: {
        etherscan: { name: 'Lineascan', url: 'https://lineascan.build/' },
        default: { name: 'Lineascan', url: 'https://lineascan.build/' },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 42,
        },
    },
} as const satisfies Chain