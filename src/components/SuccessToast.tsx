import { Box, Link } from "@chakra-ui/react";
import React from "react";
import { Address, Chain, useNetwork } from "wagmi";

interface SuccessProps {
    chainId: Chain["id"];
    hash?: Address;
}

const Success = ({ chainId, hash }: SuccessProps): JSX.Element => {
    const { chains } = useNetwork();
    const currentChain = chains.find((chain) => chain.id === chainId);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                fontSize: "0.8125rem",
                alignItems: "flex-start",
            }}>
            <h1>Intent Successful!</h1>

            {currentChain?.blockExplorers?.default?.url && (
                <Link
                    href={hash && `${currentChain?.blockExplorers?.default.url}/tx/${hash}`}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5em",
                            textDecoration: "underline",
                            lineHeight: 1.5,
                            fontWeight: 500,
                        }}
                    >
                        View on Explorer
                    </Box>
                </Link>
            )}
        </Box>
    );
};

export default Success;
