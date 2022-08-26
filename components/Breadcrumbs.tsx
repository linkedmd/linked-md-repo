import { tw } from 'twind'
import Link from 'next/link'

function StandardLink({ href, children }) {
  return (
    <Link href={href}>
      <a className={tw`underline hover:text-gray-600`}>{children}</a>
    </Link>
  )
}

export default function Breadcrumbs({ author, name, cid }) {
  return (
    <h2 className={tw`text-3xl`}>
      <span className={tw`text-gray-400`}>
        <StandardLink href={`/${author.ensName || author.address}`}>
          {author.formatted}
        </StandardLink>{' '}
        {name && '/ '}
        {cid && (
          <>
            <StandardLink href={`/${author.ensName || author.address}/${name}`}>
              {name}
            </StandardLink>
            {' / '}
          </>
        )}
      </span>
      {cid
        ? `${cid.substring(0, 8)}...
                      ${cid.slice(-8)}`
        : name}
    </h2>
  )
}
