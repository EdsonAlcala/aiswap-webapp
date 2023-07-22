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
import { getChainId, getTokenAddress } from "@/utils";

const prompt = PromptTemplate.fromTemplate(`For the following text, extract the following information:

from: The origin Blockchain on which the user wants to swap from \

to: The destination Blockchain on which the user wants to receive the tokens swapped \

tokenInput: The token the user wants to swap \

tokenOutput: The token the user wants to receive \

tokenInputAmount: The amount of token the user wants to swap \

Format the output as JSON with the following keys:
from
to
tokenInput
tokenOutput
tokenInputAmount

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
}

export default function IntentView() {
    const { address } = useAccount()
    const { connect, connectors } = useConnect()
    const [userIntent, setUserIntent] = useState('')
    const [intentDecoded, setIntentDecoded] = useState<IntentDecoded | undefined>(undefined);

    const publicClient = usePublicClient()
    const [requiresAllowance, setRequiresAllowance] = useState(false)
    const [isQuoting, setIsQuoting] = useState(false)
    const [outPutAmount, setOutPutAmount] = useState<number | undefined>(undefined)

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
            setOutPutAmount(undefined);
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

    const calculateOutputAmount = () => {
        const outputAmount = intentDecoded?.tokenInputAmount;
        setOutPutAmount(outputAmount);
    }

    // useEffect(() => {
    //     setTimeout(() => {
    //         setIsQuoting(false);
    //         calculateOutputAmount();
    //     }, 3000);
    // }, [isQuoting])

    async function quote() {
        setIsQuoting(true);

        const messages = await prompt.format({
            text: userIntent // Example: I want to swap 10 USDC from Ethereum to 10 DAI in Gnosis chain
        });

        const response = await llm.predict(messages);

        try {
            const decoded = JSON.parse(response) as IntentDecoded;
            console.log(decoded);

            if (decoded.to && decoded.from && decoded.tokenInput && decoded.tokenOutput && decoded.tokenInputAmount) {
                setIntentDecoded(decoded);
            }

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

            setTimeout(() => {
                setIsQuoting(false);
                calculateOutputAmount();
            }, 3000);

        } catch (error) {
            console.log("Invalid response, so we don't change state");
        }
    }

    async function swap() {
        if (intentDecoded && outPutAmount) {
            write({
                args: [
                    {
                        tokenInputAddress: getTokenAddress(intentDecoded.tokenInput),
                        tokenOutputAddress: getTokenAddress(intentDecoded.tokenOutput),
                        tokenInputAmount: ethers.parseEther(intentDecoded.tokenInputAmount.toString()),
                        minimumTokenOutputAmount: ethers.parseEther(outPutAmount.toString()),
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
        setOutPutAmount(undefined);
    }

    const handleKeyUp = (e: any) => {
        if (e.key === 'Enter') {
            quote();
        }
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
                            onKeyUp={handleKeyUp}
                            placeholder="i.e Swap 10 DAI for 10 USDC in Arbitrum"
                            fontWeight="400"
                            disabled={!address || anAssetIsNotSupported}
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
                        {isQuoting && (
                            <Flex flexDirection={"row"} alignItems={"center"}>
                                Fetching best price...
                                <div style={{ padding: '1em' }}>
                                    <Spinner color="red.500" />
                                </div>
                            </Flex>

                        )}
                        {!isQuoting && outPutAmount && (
                            <Flex flexDirection={"row"} alignItems={"center"}>
                                You will get {outPutAmount} {intentDecoded?.tokenOutput}
                            </Flex>)}
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

                        {userIntent !== '' && !anAssetIsNotSupported && intentDecoded && (
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
                                {isQuoting && (
                                    <Flex flexDirection={"row"} alignItems={"center"}>
                                        Quoting...
                                    </Flex>
                                )}
                                {(!isLoading && !isApproving && !isQuoting) ? requiresAllowance ? "Approve" : "Swap" : ""}
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