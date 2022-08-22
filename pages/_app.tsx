import type { AppProps } from 'next/app'
import withTwindApp from '@twind/next/app'
import { tw } from 'twind'
import React from 'react'

import '@rainbow-me/rainbowkit/styles.css'

import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider } = configureChains(
  [chain.mainnet],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const navigation = [
  {
    name: 'All packages',
    href: '/',
  },
  {
    name: 'New package or version',
    href: '/new',
  },
]

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          borderRadius: 'small',
        })}
      >
        <div className={tw`max-w-xl m-auto px-4 py-8`}>
          <h1 className={tw`text-2xl`}>Linked Markdown packages</h1>
          <ul className={tw`flex flex-row gap-4 my-8`}>
            {navigation.map((item, i) => (
              <React.Fragment key={i}>
                <li key={i} className={tw`text-gray-400 hover:text-gray-600`}>
                  <a href={item.href}>{item.name}</a>
                </li>
                {i + 1 < navigation.length && '|'}
              </React.Fragment>
            ))}
          </ul>
          <Component {...pageProps} />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default withTwindApp(MyApp)
