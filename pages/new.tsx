import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { tw } from 'twind'
import WebsiteHead from '../components/Head'

const Home: NextPage = () => {
  return (
    <form>
      <WebsiteHead title="Create a new package or a new version of an existing package" />
      <div className={tw`my-8`}>
        <label>Author</label>
        <ConnectButton />
      </div>
      <div className={tw`my-8 flex flex-col`}>
        <label>Package name</label>
        <input type="text" name="name" required className={tw`border h-8 `} />
      </div>
      <div className={tw`my-8 flex flex-col`}>
        <label>Package URL</label>
        <input type="url" name="url" required className={tw`border h-8`} />
      </div>
      <button
        type="submit"
        className={tw`w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-sm text-sm px-5 py-2.5 mr-2 mb-2`}
      >
        Create/update package
      </button>
    </form>
  )
}

export default Home
