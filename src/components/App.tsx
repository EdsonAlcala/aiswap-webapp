import { Box, ChakraProvider, Flex } from '@chakra-ui/react'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ToastContainer } from 'react-toastify';

import IntentView from '@/components/IntentView'
import Header from '@/components/Header'


import { WagmiConfig } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

import { chains, config } from '../others/wagmi'

export default function App() {
    return (
        <>
            <WagmiConfig config={config}>
                <RainbowKitProvider chains={chains}>
                    <ChakraProvider>
                        <Flex id="main-body" flexDirection="column" alignContent="stretch" background="radial-gradient(100% 100% at 50% 0%, rgba(255, 184, 226, 0.51) 0%, rgba(255, 255, 255, 0) 100%), rgb(255, 255, 255)">
                            <Box width="100%">
                                <Header>
                                    <ConnectButton />
                                </Header>
                            </Box>
                        </Flex>
                        <IntentView />
                        <ToastContainer theme='colored' />
                    </ChakraProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </>
    )
}