import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { tw } from 'twind'
import { getPackage } from '../../lib/database'
import Link from 'next/link'
import Breadcrumbs from '../../components/Breadcrumbs'
import { formatAddressOrEnsName } from '../../lib/ens'
import WebsiteHead from '../../components/Head'
import { Package } from '../../lib/types'

type Props = {
  pkg: Package
}

const Package: NextPage<Props> = ({ pkg }) => {
  return (
    <div>
      <WebsiteHead title={`${pkg.author.formatted} / ${pkg.name}`} />
      {pkg.name ? (
        <>
          <Breadcrumbs author={pkg.author} name={pkg.name} />
          <h3 className={tw`text-2xl my-8`}>All versions</h3>
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>IPFS ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className={tw`bg-white dark:bg-slate-800`}>
              {pkg.versions.map((pkgVersion, i) => (
                <Link
                  href={`/${pkg.author.ensName || pkg.author.address}/${
                    pkg.name
                  }/${pkgVersion.cid}`}
                  key={i}
                >
                  <tr className={tw`cursor-pointer hover:bg-gray-100`}>
                    <td
                      className={tw`border-b border-slate-100  text-slate-500 `}
                    >
                      {i}
                    </td>{' '}
                    <td
                      className={tw`border-b border-slate-100  p-4 pl-8 text-slate-500 `}
                    >
                      {pkgVersion.cid.substring(0, 8)}...
                      {pkgVersion.cid.slice(-8)}
                    </td>
                    <td
                      className={tw`border-b border-slate-100 p-4 pl-8 text-slate-500 `}
                    >
                      {new Date(pkgVersion.createdAt).toDateString()}
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>Package not found</>
      )}
    </div>
  )
}

export async function getServerSideProps({
  query,
}: {
  query: { author: string; name: string }
}) {
  const { author, name } = query
  const formattedAuthor = await formatAddressOrEnsName(author)
  if (formattedAuthor.ensName && formattedAuthor.ensName !== author) {
    return {
      redirect: {
        destination: `/${formattedAuthor.ensName}/${name}`,
        permanent: false,
      },
    }
  }

  let pkg = await getPackage({
    authorAddress: formattedAuthor.address,
    name: query.name,
  })

  if (pkg) pkg.author = formattedAuthor

  return {
    props: { pkg },
  }
}

export default Package
