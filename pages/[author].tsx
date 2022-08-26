import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { tw } from 'twind'
import { getAuthor } from '../lib/database'
import Link from 'next/link'
import Breadcrumbs from '../components/Breadcrumbs'
import { formatAddressOrEnsName } from '../lib/ens'
import WebsiteHead from '../components/Head'
import { Author } from '../lib/types'

type Props = {
  author: Author
}

const Author: NextPage<Props> = ({ author }) => {
  return (
    <div>
      <WebsiteHead title={author.formatted} />
      {author.address ? (
        <>
          <Breadcrumbs author={author} />
          <h3 className={tw`text-2xl my-8`}>Packages by {author.formatted}</h3>
          <table className={tw`border-collapse table-auto w-full text-sm`}>
            <thead>
              <tr>
                <th
                  className={tw`border-b font-medium pr-4 pt-0 pb-3 text-slate-400 text-left`}
                >
                  Name
                </th>
              </tr>
            </thead>
            <tbody className={tw`bg-white dark:bg-slate-800`}>
              {author.publishedPackages.map((pkg, i) => (
                <Link
                  href={`/${author.ensName || author.address}/${pkg.name}`}
                  key={i}
                >
                  <tr className={tw`cursor-pointer hover:bg-gray-100`}>
                    <td
                      className={tw`border-b border-slate-100 py-4 text-slate-500 `}
                    >
                      {pkg.name}
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>Author not found</>
      )}
    </div>
  )
}

export async function getServerSideProps({
  query,
}: {
  query: { author: string }
}) {
  const { author } = query
  const formattedAuthor = await formatAddressOrEnsName(author)
  if (formattedAuthor.ensName && formattedAuthor.ensName !== author) {
    return {
      redirect: {
        destination: `/${formattedAuthor.ensName}`,
        permanent: false,
      },
    }
  }

  let authorResult = await getAuthor({
    authorAddress: formattedAuthor.address,
  })

  return {
    props: { author: { ...authorResult, ...formattedAuthor } },
  }
}

export default Author
