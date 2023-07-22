export const getTokenAddress = (tokenName: string) => {
    switch (tokenName.toLowerCase()) {
        case "usdc":
            return "0x131823ca7E06cacbDF4B04d14fF2fb4FB2EEF6B7";
        case "weth":
            return "0xBb50908414e123D835e9c0ef42d4BA957d621D45";
        default:
            throw new Error("Token not supported")
    }
}

export const getChainId = (chainName: string) => {
    // MAINNETS
    if (chainName.toLowerCase() === "ethereum") {
        return 1
    }

    if (chainName.toLowerCase() === "gnosis" || chainName.toLowerCase() === "gnosis chain") {
        return 100
    }

    if (chainName.toLowerCase() === "arbitrum" || chainName.toLowerCase() === "arbitrum one") {
        return 42161
    }

    if (chainName.toLowerCase() === "op" || chainName.toLowerCase() === "optimism") {
        return 10
    }

    // TESTNETS
    if (chainName.toLowerCase() === "gnosis chiado testnet" || chainName.toLowerCase() === "gnosis testnet") {
        return 10200
    }

    if (chainName.toLowerCase() === "goerli") {
        return 5
    }

    if (chainName.toLowerCase() === "arbitrum goerli" || chainName.toLowerCase() === "arbitrum testnet") {
        return 421613
    }

    if (chainName.toLowerCase() === "linea testnet") {
        return 59140
    }
}
