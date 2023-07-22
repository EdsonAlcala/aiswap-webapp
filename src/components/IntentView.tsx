import { Box, Button, Flex, Input, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { ethers } from "ethers";
import { useAccount, useContractWrite } from "wagmi";
import ABI from "../abis/AISwap.json";

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
    const [userIntent, setUserIntent] = useState('')
    const [intentDecoded, setIntentDecoded] = useState<IntentDecoded | undefined>(undefined);

    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: process.env.NEXT_PUBLIC_AISWAP_ADDRESS as any,
        abi: ABI,
        functionName: 'createAuction',
    })

    // Handle processing of input value
    const intervalRef = useRef<number | undefined>();

    const processInputValue = async () => {
        const messages = await prompt.format({
            text: userIntent //"I want to swap 10 USDC from Ethereum to 10 DAI in Gnosis chain."
        });

        const response = await llm.predict(messages);

        try {
            const decoded = JSON.parse(response) as IntentDecoded;
            console.log(decoded);

            if (decoded.to && decoded.from && decoded.tokenInput && decoded.tokenOutput && decoded.tokenInputAmount && decoded.tokenOutputAmount) {
                setIntentDecoded(decoded);
            }
        } catch (error) {
            console.log("Invalid response, so we don't change state");
        }
    };

    useEffect(() => {
        if (userIntent !== '') {
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

    const getChainId = (chainName: string) => {
        if (chainName.toLowerCase() === "ethereum") return 1
        if (chainName.toLowerCase() === "gnosis" || chainName.toLowerCase() === "gnosis chain") return 2
        if (chainName.toLowerCase() === "arbitrum") return 42161
        if (chainName.toLowerCase() === "optimism") return 10
        if (chainName.toLowerCase() === "xdai") return 100
        // goerli
        // arbitrum goerli
    }

    async function swap() {
        if (intentDecoded) {
            write({
                args: [
                    {
                        tokenInputAddress: intentDecoded.tokenInput,
                        tokenOutputAddress: intentDecoded.tokenOutput,
                        tokenInputAmount: ethers.parseEther(intentDecoded.tokenInputAmount.toString()),
                        minimumTokenOutputAmount: ethers.parseEther(intentDecoded.tokenOutputAmount.toString()),
                        sourceChain: getChainId(intentDecoded.from),
                        destinationChain: getChainId(intentDecoded.to)
                    }
                ],
            });
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
                            placeholder="Swap 10 DAI for 10 USDC in Arbitrum"
                            fontWeight="400"
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
                        {userIntent === '' && (
                            <Button
                                color="rgb(213, 0, 102)"
                                bg="rgb(253, 234, 241)"
                                width="100%"
                                p="1.62rem"
                                borderRadius="1.25rem"
                                disabled={userIntent === ''}
                                _hover={{ bg: 'rgb(251, 211, 225)' }}>
                                Write your intent
                            </Button>)}

                        {userIntent !== '' && (
                            <Button
                                onClick={() => swap()}
                                color="rgb(213, 0, 102)"
                                bg="rgb(253, 234, 241)"
                                width="100%"
                                p="1.62rem"
                                borderRadius="1.25rem"
                                disabled={userIntent === '' || !intentDecoded} // TODO: Disable when is Swapping
                                _hover={{ bg: 'rgb(251, 211, 225)' }}>
                                {intentDecoded ? "Swap" : "Processing..."}
                            </Button>)}

                        {isLoading && (
                            <div style={{ padding: '1em' }}>
                                <Spinner color="red.500" />
                            </div>
                        )}
                    </Box>
                </Flex>
            </Box>
        </Flex>
    )
}