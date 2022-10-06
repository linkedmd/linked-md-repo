import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { tw } from 'twind'
import { getPackageVersion } from '../../../lib/database'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { formatAddressOrEnsName } from '../../../lib/ens'
import WebsiteHead from '../../../components/Head'
import { PackageVersion } from '../../../lib/types'
import Link from 'next/link'
import { LinkedMarkdownViewer } from '@linkedmd/components'

type Props = {
  pkgVersion: PackageVersion
}

const dependantOrDependency = (pkgVersion: PackageVersion, i: number) => {
  return (
    <Link
      href={`/${
        pkgVersion.package.author.ensName || pkgVersion.package.author.address
      }/${pkgVersion.package.name}/${pkgVersion.cid}`}
      key={i}
    >
      <li
        className={tw`cursor-pointer underline text-gray-400 hover:text-gray-600`}
      >
        {pkgVersion.package.author.ensName ||
          pkgVersion.package.author.address.substring(0, 8)}
        ...
        {pkgVersion.package.author.address.slice(-8)} /{' '}
        {pkgVersion.package.name} / {pkgVersion.cid.substring(0, 8)}...
        {pkgVersion.cid.slice(-8)}
      </li>
    </Link>
  )
}

const PackageVersion: NextPage<Props> = ({ pkgVersion }) => {
  return (
    <div>
      <WebsiteHead
        title={`${pkgVersion.package.author.formatted} / ${pkgVersion.package.name} / ${pkgVersion.cid}`}
      />
      {pkgVersion.cid ? (
        <>
          <Breadcrumbs
            author={pkgVersion.package.author}
            name={pkgVersion.package.name}
            cid={pkgVersion.cid}
          />
          <a
            href={`https://${pkgVersion.cid}.ipfs.nftstorage.link`}
            rel="noreferrer"
            target="_blank"
            className={tw`block mt-8 text-2xl underline text-gray-400 hover:text-gray-600`}
          >
            View source on IPFS
          </a>
          <h3 className={tw`text-2xl mt-8`}>Dependencies</h3>
          <ul className={tw`bg-white dark:bg-slate-800`}>
            {pkgVersion.dependencies &&
              pkgVersion.dependencies.map((depPkgVersion, i) =>
                dependantOrDependency(depPkgVersion, i)
              )}
          </ul>
          <h3 className={tw`text-2xl mt-8`}>Dependants</h3>
          <ul className={tw`bg-white dark:bg-slate-800`}>
            {pkgVersion.dependants &&
              pkgVersion.dependants.map((depPkgVersion, i) =>
                dependantOrDependency(depPkgVersion, i)
              )}
          </ul>
          <h3 className={tw`text-2xl mt-8`}>Preview</h3>
          <LinkedMarkdownViewer
            fileURI={`https://${pkgVersion.cid}.ipfs.nftstorage.link`}
          />
        </>
      ) : (
        <>Package version not found</>
      )}
    </div>
  )
}

export async function getServerSideProps({
  query,
}: {
  query: { author: string; name: string; cid: string }
}) {
  const { author, name, cid } = query
  const formattedAuthor = await formatAddressOrEnsName(author)
  if (formattedAuthor.ensName && formattedAuthor.ensName !== author) {
    return {
      redirect: {
        destination: `/${formattedAuthor.ensName}/${name}/${cid}`,
        permanent: false,
      },
    }
  }

  let pkgVersion = await getPackageVersion({ cid })

  if (pkgVersion) pkgVersion.package.author = formattedAuthor

  return {
    props: { pkgVersion },
  }
}

export default PackageVersion
