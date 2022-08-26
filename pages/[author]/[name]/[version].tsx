import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { tw } from 'twind'
import { getPackageVersion } from '../../../lib/database'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { formatAddressOrEnsName } from '../../../lib/ens'
import WebsiteHead from '../../../components/Head'

const Package: NextPage = ({ pkgVersion }) => {
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
          <a href={`https://${pkgVersion.cid}.ipfs.nftstorage.link`}>IPFS</a>
        </>
      ) : (
        <>Package version not found</>
      )}
    </div>
  )
}

export async function getServerSideProps({ query }) {
  const { author, name, cid } = query
  const formattedAuthor = await formatAddressOrEnsName(author)
  if (formattedAuthor.ensName && formattedAuthor.ensName !== author) {
    return {
      redirect: {
        destination: `/${ensName}/${name}/${version}`,
        permanent: false,
      },
    }
  }

  let pkgVersion = await getPackageVersion({
    authorAddress: formattedAuthor.address,
    name,
    cid,
  })

  if (pkgVersion) pkgVersion.package.author = formattedAuthor

  return {
    props: { pkgVersion },
  }
}

export default Package
