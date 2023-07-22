import { Box, Button, Flex, Input, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

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



export default function IntentView() {
    const [userIntent, setUserIntent] = useState('')
    const [isSwapping, setIsSwapping] = useState(false)

    async function swap() {
        setIsSwapping(true)
        // TODO
    }

    const test = async () => {
        const messages = await prompt.format({
            text: "I want to swap 10 USDC from Ethereum to 10 DAI in Gnosis chain."
        });

        const response = await llm.predict(messages);

        console.log((JSON.parse(response)).to);
    }

    useEffect(() => {
        test()
            .then(() => {

            })
            .catch((err) => {
            })
    }, [])

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
                                onClick={swap}
                                color="rgb(213, 0, 102)"
                                bg="rgb(253, 234, 241)"
                                width="100%"
                                p="1.62rem"
                                borderRadius="1.25rem"
                                disabled={userIntent === ''} // TODO: Disable when is Swapping
                                _hover={{ bg: 'rgb(251, 211, 225)' }}>
                                Swap
                            </Button>)}

                        {isSwapping && (
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