import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { tw } from 'twind'
import WebsiteHead from '../components/Head'
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import { chain, chains, provider } from '../lib/web3'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useEnsName } from 'wagmi'
import Link from 'next/link'
import React from 'react'
import { PublishingErrors } from '../lib/types'
import '@rainbow-me/rainbowkit/styles.css'

const NewPackage: NextPage = () => {
  const { data: session, status } = useSession()
  const { data: ensName } = useEnsName({ address: session?.address as string })
  const [response, setResponse] = useState<{ error?: PublishingErrors }>({})
  const [packageName, setPackageName] = useState('')

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    const target = event.target as typeof event.target & {
      name: { value: string }
      url: { value: string }
    }

    setPackageName(target.name.value)

    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: target.name.value,
        url: target.url.value,
      }),
    })

    const result = await res.json()
    setResponse(result)
  }

  const errors = {
    unauthorized:
      'You are unauthorized to publish this package. Are you sure you are the owner?',
    fileFetch: 'Fetching your file failed. Are you sure the URL is right?',
    ipfsUpload:
      'Uploading your file to IPFS failed. This is likely an internal error.',
    database:
      'Adding your file to the database failed. This is likely an internal error.',
  }

  return (
    <RainbowKitSiweNextAuthProvider>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          borderRadius: 'small',
        })}
      >
        {response.success ||
          (response.error && (
            <div className={tw`border p-4`}>
              {response.error ? (
                <span className={tw`text-red-600`}>
                  {errors[response.error]}
                </span>
              ) : (
                <span className={tw`text-green-600`}>
                  Your package has been published!{' '}
                  <Link
                    href={`/${
                      ensName ? ensName : session?.address
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
          ))}
        <form onSubmit={handleSubmit}>
          <WebsiteHead title="Create a new package or a new version of an existing package" />
          <div className={tw`my-8`}>
            <label>Author</label>
            <ConnectButton />
          </div>
          <div className={tw`my-8 flex flex-col`}>
            <label htmlFor="name">Package name</label>
            <p className={tw`text-sm italic`}>
              To publish a new version of an existing package, type the package
              name here
            </p>
            <input
              type="text"
              name="name"
              required
              className={tw`border h-8 `}
            />
          </div>
          <div className={tw`my-8 flex flex-col`}>
            <label htmlFor="url">Package URL</label>
            <p className={tw`text-sm italic`}>
              Any HTTP/HTTPS URL works, and then your file will be uploaded to
              IPFS
            </p>
            <input type="url" name="url" required className={tw`border h-8`} />
          </div>
          <button
            type="submit"
            className={tw`w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-sm text-sm px-5 py-2.5 mr-2 mb-2`}
          >
            Publish package
          </button>
        </form>
      </RainbowKitProvider>
    </RainbowKitSiweNextAuthProvider>
  )
}

export default NewPackage
