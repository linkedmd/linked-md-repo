import type { AppProps } from 'next/app'
import withTwindApp from '@twind/next/app'
import { tw } from 'twind'
import React from 'react'
import Link from 'next/link'

import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { SessionProvider } from 'next-auth/react'
import { AppProps } from 'next/app'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { chains, provider } from '../lib/web3'

const { connectors } = getDefaultWallets({
  appName: 'Linked Markdown packages',
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
    href: '/pkg/new',
  },
]

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <SessionProvider refetchInterval={0} session={pageProps.session}>
        <div className={tw`max-w-xl m-auto px-4 py-8`}>
          <h1 className={tw`text-2xl`}>Linked Markdown packages</h1>
          <ul className={tw`flex flex-row gap-4 my-8`}>
            {navigation.map((item, i) => (
              <React.Fragment key={i}>
                <li key={i} className={tw`text-gray-400 hover:text-gray-600`}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
                {i + 1 < navigation.length && '|'}
              </React.Fragment>
            ))}
          </ul>
          <Component {...pageProps} />
        </div>
      </SessionProvider>
    </WagmiConfig>
  )
}

export default withTwindApp(MyApp)
