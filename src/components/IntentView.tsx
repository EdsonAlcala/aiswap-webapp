import { Box, Button, Flex, Input, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { ethers } from "ethers";
import { useAccount, useConnect, useContractWrite, useNetwork, usePublicClient } from "wagmi";
import { toast } from 'react-toastify';

import ABI from "../abis/AISwap.json";
import ERC20ABI from '../abis/ERC20.json';
import SuccessToast from "./SuccessToast";

const prompt = PromptTemplate.fromTemplate(`For the following text, extract the following information:

from: The origin Blockchain on which the user wants to swap from \

to: The destination Blockchain on which the user wants to receive the tokens swapped \

tokenInput: The token the user wants to swap \

tokenOutput: The token the user wants to receive \

tokenInputAmount: The amount of token the user wants to swap \

tokenOutputAmount: The amount of token the user wants to receive \

Format the output as JSON with the following keys:
from
to
tokenInput
tokenOutput
tokenInputAmount
tokenOutputAmount

text: {text}

`);

const llm = new OpenAI({
    openAIApiKey: "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"
});

interface IntentDecoded {
    from: string;
    to: string;
    tokenInput: string;
    tokenOutput: string;
    tokenInputAmount: number;
    tokenOutputAmount: number;
}

export default function IntentView() {
    const { address } = useAccount()
    const { connect, connectors } = useConnect()
    const [userIntent, setUserIntent] = useState('')
    const [intentDecoded, setIntentDecoded] = useState<IntentDecoded | undefined>(undefined);

    const publicClient = usePublicClient()
    const [requiresAllowance, setRequiresAllowance] = useState(false)

    // To handle assets not supported
    const [anAssetIsNotSupported, setAnAssetIsNotSupported] = useState(false)
    const [assetNotSupported, setAssetNotSupported] = useState('')
    const { chain } = useNetwork()

    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: process.env.NEXT_PUBLIC_AISWAP_ADDRESS as any,
        abi: ABI,
        functionName: 'createAuction',
        onSuccess(data) {
            console.log("Swap successful", data)
            setIntentDecoded(undefined);
            setUserIntent('');
            toast.success(
                <SuccessToast
                    chainId={chain?.id as any}
                    hash={data.hash}
                />,
                {
                    autoClose: 10000,
                    toastId: data.hash,
                }
            );
        }
    })

    const { data: approvalData, isLoading: isApproving, isSuccess: isApprovalSuccessful, write: approve } = useContractWrite({
        abi: ERC20ABI,
        functionName: 'approve',
        onSuccess(data) {
            console.log("Approve successful", data)
            setRequiresAllowance(false);
            toast.success(
                <SuccessToast
                    chainId={chain?.id as any}
                    hash={data.hash}
                />,
                {
                    autoClose: 10000,
                    toastId: data.hash,
                }
            );
        },
    })

    const getTokenAddress = (tokenName: string) => {
        switch (tokenName.toLowerCase()) {
            case "usdc":
                return "0x131823ca7E06cacbDF4B04d14fF2fb4FB2EEF6B7";
            case "weth":
                return "0xBb50908414e123D835e9c0ef42d4BA957d621D45";
            default:
                throw new Error("Token not supported")
        }
    }

    const getChainId = (chainName: string) => {
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

    // Handle processing of input value
    const intervalRef = useRef<number | undefined>();

    const processInputValue = async () => {
        const messages = await prompt.format({
            text: userIntent // Example: I want to swap 10 USDC from Ethereum to 10 DAI in Gnosis chain
        });

        const response = await llm.predict(messages);

        try {
            const decoded = JSON.parse(response) as IntentDecoded;
            console.log(decoded);

            if (decoded.to && decoded.from && decoded.tokenInput && decoded.tokenOutput && decoded.tokenInputAmount && decoded.tokenOutputAmount) {
                setIntentDecoded(decoded);

                try {
                    getTokenAddress(decoded.tokenInput)
                } catch (error) {
                    setAssetNotSupported(decoded.tokenInput);
                    setAnAssetIsNotSupported(true);
                    return;
                }

                try {
                    getTokenAddress(decoded.tokenOutput);
                } catch (error) {
                    setAssetNotSupported(decoded.tokenOutput);
                    setAnAssetIsNotSupported(true);
                    return;
                }

                // we are sure only supported assets will reach this point
                const currentAllowance: any = await publicClient.readContract({
                    address: getTokenAddress(decoded.tokenInput),
                    abi: ERC20ABI,
                    functionName: 'allowance',
                    args: [
                        address,
                        process.env.NEXT_PUBLIC_AISWAP_ADDRESS
                    ]
                })

                console.log("Current allowance: ", currentAllowance)

                const requiredAllowance = ethers.parseEther(decoded.tokenInputAmount.toString());

                console.log("Required allowance: ", requiredAllowance)

                if (currentAllowance < requiredAllowance) {
                    console.log("It requires allowance")
                    setRequiresAllowance(true);
                }
            }
        } catch (error) {
            console.log("Invalid response, so we don't change state");
        }
    };

    useEffect(() => {
        if (userIntent !== '') {

            setIntentDecoded(undefined);

            const intervalFunction = () => {
                processInputValue()
            };

            intervalRef.current = window.setInterval(intervalFunction, 5000);

            return () => {
                clearInterval(intervalRef.current);
            };
        } else {
            clearInterval(intervalRef.current);
        }
    }, [userIntent]);

    useEffect(() => {
        if (intentDecoded) {
            clearInterval(intervalRef.current);
        }
    }, [intentDecoded]);

    async function swap() {
        if (intentDecoded) {
            write({
                args: [
                    {
                        tokenInputAddress: getTokenAddress(intentDecoded.tokenInput),
                        tokenOutputAddress: getTokenAddress(intentDecoded.tokenOutput),
                        tokenInputAmount: ethers.parseEther(intentDecoded.tokenInputAmount.toString()),
                        minimumTokenOutputAmount: ethers.parseEther(intentDecoded.tokenOutputAmount.toString()),
                        sourceChain: getChainId(intentDecoded.from),
                        destinationChain: getChainId(intentDecoded.to)
                    }
                ],
            });
        }
    }

    async function approveTokenAllowance() {
        if (intentDecoded) {
            const requiredAllowance = ethers.parseEther(intentDecoded.tokenInputAmount.toString());

            approve({
                address: getTokenAddress(intentDecoded.tokenInput),
                args: [
                    process.env.NEXT_PUBLIC_AISWAP_ADDRESS,
                    requiredAllowance
                ],
            } as any);
        }
    }

    const retry = () => {
        setAnAssetIsNotSupported(false);
        setAssetNotSupported('');
        setUserIntent('');
        setIntentDecoded(undefined);
    }

    return (
        <Flex justifyContent="center" flex={1} alignContent="center" alignItems="center">
            <Box
                w="30.62rem"
                mx="auto"
                borderRadius="1.37rem"
                marginTop={{ base: '10rem', md: '10rem' }}
                boxShadow="0px 0px 20px rgba(0, 0, 0, 0.05)"
            >
                <Button onClick={() => toast.success(
                    <SuccessToast
                        chainId={chain?.id as any}
                        hash={"0x1234567890"}
                    />,
                    {
                        autoClose: 10000,
                        toastId: "0x1234567890"
                    }
                )}>Show Toast</Button>
                <Flex
                    alignItems="left"
                    flexDirection="column"
                    rowGap={{ base: '0.5rem', md: '0.5rem' }}
                    p="1rem 1.25rem 0.5rem"
                    bg="white"
                    color="rgb(86, 90, 105)"
                    justifyContent="space-between"
                    borderRadius="1.37rem 1.37rem 0 0"
                >
                    <Box>
                        <Text color="black" fontWeight="500">
                            What would you like to Swap today?
                        </Text>
                    </Box>

                    <Box>
                        <Input
                            placeholder="i.e Swap 10 DAI for 10 USDC in Arbitrum"
                            fontWeight="400"
                            disabled={!address}
                            fontSize="0.9rem"
                            width="100%"
                            height={{ base: '4em', md: '4em' }}
                            borderRadius="1.25rem"
                            size="19rem"
                            textAlign="center"
                            bg="rgb(247, 248, 250)"
                            outline="none"
                            border="none"
                            focusBorderColor="none"
                            onChange={e => setUserIntent(e.target.value)}
                            value={userIntent}
                        />
                    </Box>
                    <Box>
                        {!address && (
                            <Button
                                color="rgb(213, 0, 102)"
                                bg="rgb(253, 234, 241)"
                                width="100%"
                                p="1.62rem"
                                borderRadius="1.25rem"
                                onClick={() => connect({
                                    connector: connectors[0]
                                })}
                                _hover={{ bg: 'rgb(251, 211, 225)' }}>
                                Connect Wallet
                            </Button>)}

                        {userIntent === '' && address && (
                            <Button
                                id="write-intent-button"
                                color="rgb(213, 0, 102)"
                                bg="rgb(253, 234, 241)"
                                width="100%"
                                p="1.62rem"
                                borderRadius="1.25rem"
                                opacity={0.8}
                                disabled={true}
                                _hover={{ bg: 'rgb(253, 234, 241)' }}>
                                Write your intent
                            </Button>)}

                        {userIntent !== '' && !anAssetIsNotSupported && (
                            <Button
                                onClick={() => requiresAllowance ? approveTokenAllowance() : swap()}
                                color="rgb(213, 0, 102)"
                                bg="rgb(253, 234, 241)"
                                width="100%"
                                p="1.62rem"
                                borderRadius="1.25rem"
                                disabled={isLoading || isApproving}
                                _hover={{ bg: 'rgb(251, 211, 225)' }}>
                                {isLoading && (
                                    <Flex flexDirection={"row"} alignItems={"center"}>
                                        Swapping...
                                        <div style={{ padding: '1em' }}>
                                            <Spinner color="red.500" />
                                        </div>
                                    </Flex>
                                )}
                                {isApproving && (
                                    <Flex flexDirection={"row"} alignItems={"center"}>
                                        Approving...
                                        <div style={{ padding: '1em' }}>
                                            <Spinner color="red.500" />
                                        </div>
                                    </Flex>
                                )}
                                {(!isLoading && !isApproving) ? intentDecoded ? (requiresAllowance ? "Approve" : "Swap") : "Processing..." : ""}
                            </Button>)}

                        {anAssetIsNotSupported && (
                            <Button
                                onClick={() => retry()}
                                color="rgb(213, 0, 102)"
                                bg="rgb(253, 234, 241)"
                                width="100%"
                                p="1.62rem"
                                borderRadius="1.25rem"
                                _hover={{ bg: 'rgb(251, 211, 225)' }}>
                                {`${assetNotSupported} not supported, Retry`}
                            </Button>)}
                    </Box>
                </Flex>
            </Box>
        </Flex>
    )
}