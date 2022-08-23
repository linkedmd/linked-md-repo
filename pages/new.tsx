import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { tw } from 'twind'
import WebsiteHead from '../components/Head'
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import { chain, chains, provider } from '../lib/web3'
import { useState, setState } from 'react'
import { useSession } from 'next-auth/react'
import { useEnsName } from 'wagmi'
import Link from 'next/link'

import '@rainbow-me/rainbowkit/styles.css'

type Message = {
  content?: String
  error?: boolean
}

const Home: NextPage = () => {
  const { data: session, status } = useSession()
  const { data: ensName } = useEnsName({ address: session?.address })
  const [response, setResponse] = useState()
  const [packageName, setPackageName] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setPackageName(event.target.name.value)

    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: event.target.name.value,
        url: event.target.url.value,
      }),
    })

    const result = await res.json()
    setResponse(result)
    console.log(result)
  }

  return (
    <RainbowKitSiweNextAuthProvider>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          borderRadius: 'small',
        })}
      >
        {response && (
          <div className={tw`border p-4`}>
            {response.error ? (
              <span className={tw`text-red-600`}>
                {
                  {
                    unauthorized:
                      'You are unauthorized to publish this package. Are you sure you are the owner?',
                  }[response.error]
                }
              </span>
            ) : (
              <span className={tw`text-green-600`}>
                Your package has been published!{' '}
                <Link
                  href={`/pkg/${
                    ensName ? ensName : session.address
                  }/${packageName}`}
                >
                  <a className={tw`underline hover:text-green-800`}>
                    Check it out
                  </a>
                </Link>
                .
              </span>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <WebsiteHead title="Create a new package or a new version of an existing package" />
          <div className={tw`my-8`}>
            <label>Author</label>
            <ConnectButton />
          </div>
          <div className={tw`my-8 flex flex-col`}>
            <label htmlFor="name">Package name</label>
            <input
              type="text"
              name="name"
              required
              className={tw`border h-8 `}
            />
          </div>
          <div className={tw`my-8 flex flex-col`}>
            <label htmlFor="url">Package URL</label>
            <input type="url" name="url" required className={tw`border h-8`} />
          </div>
          <button
            type="submit"
            className={tw`w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-sm text-sm px-5 py-2.5 mr-2 mb-2`}
          >
            Create/update package
          </button>
        </form>
      </RainbowKitProvider>
    </RainbowKitSiweNextAuthProvider>
  )
}

export default Home
