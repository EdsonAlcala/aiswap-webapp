import Head from 'next/head'
import { Box, ChakraProvider, Flex } from '@chakra-ui/react'

import { ConnectButton } from '@rainbow-me/rainbowkit'

import IntentView from '@/components/IntentView'
import Header from '@/components/Header'

export default function Home() {
  return (
    <>
      <Head>
        <title>AISwap</title>
        <meta name="description" content="AISwap" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <ChakraProvider>
          <Flex id="main-body" flexDirection="column" alignContent="stretch" background="radial-gradient(100% 100% at 50% 0%, rgba(255, 184, 226, 0.51) 0%, rgba(255, 255, 255, 0) 100%), rgb(255, 255, 255)">
            <Box width="100%">
              <Header>
                <ConnectButton />
              </Header>
            </Box>
          </Flex>
          <IntentView />
        </ChakraProvider>
      </main>
    </>
  )
}
