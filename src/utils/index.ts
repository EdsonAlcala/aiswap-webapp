const GNOSIS_CHAIN_ID = 100
const ARBITRUM_CHAIN_ID = 42161
const LINEA_CHAIN_ID = 59144
const ARBITRUM_GOERLI_CHAIN_ID = 421613
const GOERLI_CHAIN_ID = 5

export const getTokenDecimals = (tokenName: string, chainId: number) => {
    if (chainId === GNOSIS_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return 6;
            case "usdt":
                return 6;
            default:
                throw new Error("Token not supported")
        }
    }

    if (chainId === ARBITRUM_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return 6;
            case "dai":
                return 18;
            case "lusd":
                return 18;
            default:
                throw new Error("Token not supported")
        }
    }

    if (chainId === LINEA_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "busd":
                return 18;
            default:
                throw new Error("Token not supported")
        }
    }

    // TESTNETS
    if (chainId === GOERLI_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return 18;
            case "weth":
                return 18;
            default:
                throw new Error("Token not supported")
        }
    }

    if (chainId === ARBITRUM_GOERLI_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return 18;
            case "weth":
                return 18;
            default:
                throw new Error("Token not supported")
        }
    }
}

export const getTokenAddress = (tokenName: string, chainId: number) => {
    console.log("chainId", chainId)
    console.log("tokenName", tokenName)

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

    // TESTNETS
    if (chainId === GOERLI_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return "0x7D11fe62Cc80c520fF5a29277Ff7a2b8414de4C5";
            case "weth":
                return "0x9bEf665Ef4123b07418ABcD869B74e94C4136c7c";
            default:
                throw new Error("Token not supported")
        }
    }

    if (chainId === ARBITRUM_GOERLI_CHAIN_ID) {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return "0x1F21E2AEEf07BF2A9a7Af7BDed43dCE3E5bEc976";
            case "weth":
                return "0x67c4B1E1D747069d6FB5f1db08EFCA7563427637";
            default:
                throw new Error("Token not supported")
        }
    }
}

export const getChainId = (chainName: string) => {
    // MAINNETS
    if (chainName.toLowerCase() === "gnosis" || chainName.toLowerCase() === "gnosis chain") {
        return GNOSIS_CHAIN_ID
    }

    if (chainName.toLowerCase() === "arbitrum" || chainName.toLowerCase() === "arbitrum one") {
        return ARBITRUM_CHAIN_ID
    }

    if (chainName.toLowerCase() === "linea") {
        return LINEA_CHAIN_ID
    }

    // TESTNETS
    if (chainName.toLowerCase() === "arbitrum goerli" || chainName.toLowerCase() === "arbitrum testnet") {
        return ARBITRUM_GOERLI_CHAIN_ID
    }

    if (chainName.toLowerCase() === "goerli" || chainName.toLowerCase() === "goerli testnet") {
        return GOERLI_CHAIN_ID
    }
}
