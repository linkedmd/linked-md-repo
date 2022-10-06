import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { tw } from 'twind'
import { getPackages } from '../lib/database'
import { formatAddressOrEnsName } from '../lib/ens'
import Link from 'next/link'
import WebsiteHead from '../components/Head'
import { Package } from '../lib/types'

type Props = {
  pkgs: Array<Package>
}

const Home: NextPage<Props> = ({ pkgs }) => {
  return (
    <div>
      <WebsiteHead title="Home" />
      <table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody className={tw`bg-white dark:bg-slate-800`}>
          {pkgs.map((pkg, i) => (
            <Link
              href={`/${pkg.author.ensName || pkg.author.address}/${pkg.name}`}
              key={i}
            >
              <tr className={tw`cursor-pointer hover:bg-gray-100`}>
                <td
                  className={tw`border-b border-slate-100 dark:border-slate-700 py-4 text-slate-500 dark:text-slate-400`}
                >
                  {pkg.author.formatted} / {pkg.name}
                </td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export async function getServerSideProps() {
  let pkgs = await getPackages()

  pkgs = await Promise.all(
    pkgs.map(async (pkg) => {
      pkg.author = await formatAddressOrEnsName(pkg.author.address)
      return pkg
    })
  )

  console.log(pkgs)

  return {
    props: { pkgs },
  }
}

export default Home
