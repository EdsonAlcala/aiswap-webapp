const GNOSIS_CHAIN_ID = 100
const ARBITRUM_CHAIN_ID = 42161
const LINEA_CHAIN_ID = 59144
const ARBITRUM_GOERLI_CHAIN_ID = 421613

export const getTokenAddress = (tokenName: string, chainId: number) => {
    if (chainId === GNOSIS_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83";
            case "usdt":
                return "0x4ecaba5870353805a9f068101a40e0f32ed605c6";
            default:
                throw new Error("Token not supported")
        }
    }

    if (chainId === ARBITRUM_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
            case "dai":
                return "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1";
            case "lusd":
                return "0x93b346b6bc2548da6a1e7d98e9a421b42541425b";
            default:
                throw new Error("Token not supported")
        }
    }

    if (chainId === LINEA_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "busd":
                return "0x7d43aabc515c356145049227cee54b608342c0ad";
            default:
                throw new Error("Token not supported")
        }
    }

    if (chainId === ARBITRUM_GOERLI_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return "0x131823ca7E06cacbDF4B04d14fF2fb4FB2EEF6B7";
            case "weth":
                return "0xBb50908414e123D835e9c0ef42d4BA957d621D45";
            default:
                throw new Error("Token not supported")
        }
    }
}

export const getChainId = (chainName: string) => {
    // MAINNETS
    // if (chainName.toLowerCase() === "ethereum") {
    //     return 1
    // }

    if (chainName.toLowerCase() === "gnosis" || chainName.toLowerCase() === "gnosis chain") {
        return GNOSIS_CHAIN_ID
    }

    if (chainName.toLowerCase() === "arbitrum" || chainName.toLowerCase() === "arbitrum one") {
        return ARBITRUM_CHAIN_ID
    }

    // if (chainName.toLowerCase() === "op" || chainName.toLowerCase() === "optimism") {
    //     return 10
    // }

    if (chainName.toLowerCase() === "linea") {
        return LINEA_CHAIN_ID
    }

    // TESTNETS
    // if (chainName.toLowerCase() === "gnosis chiado testnet" || chainName.toLowerCase() === "gnosis testnet") {
    //     return 10200
    // }

    // if (chainName.toLowerCase() === "goerli") {
    //     return 5
    // }

    if (chainName.toLowerCase() === "arbitrum goerli" || chainName.toLowerCase() === "arbitrum testnet") {
        return ARBITRUM_GOERLI_CHAIN_ID
    }

    // if (chainName.toLowerCase() === "linea testnet") {
    //     return 59140
    // }
}
