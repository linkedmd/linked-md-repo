import { getSession } from 'next-auth/react'
import { getToken } from 'next-auth/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NFTStorage, Blob } from 'nft.storage'
import { getPackageVersion, createPackage } from '../../lib/database'
import { PublishingErrors } from '../../lib/types'
import { LinkedMarkdown } from '@linkedmd/parser'
import { formatAddressOrEnsName } from '../../lib/ens'

const client = new NFTStorage({
  token: process.env.NFTSTORAGE_KEY || '',
})

export default async function publish(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })

  try {
    if (!session) throw PublishingErrors.Unauthorized

    const token = await getToken({ req })
    const authorAddress = token?.sub ?? null

    if (!authorAddress) throw PublishingErrors.Unauthorized

    const { name, url } = req.body

    let request
    let blob
    try {
      request = await fetch(url)
      blob = await request.blob()
    } catch (e) {
      throw PublishingErrors.FileFetch
    }

    let imports
    try {
      const file = new LinkedMarkdown(await blob.text())
      await file.parse()
      imports = await Promise.all(
        file.imports.map(async (importObj) => {
          if (!importObj.named || importObj.from.indexOf('ipfs://') !== 0)
            return

          const [cid, name, author] = importObj.from
            .split('ipfs://')[1]
            .split('#')
          const formattedAuthor = await formatAddressOrEnsName(author)
          return {
            cid,
            package: {
              name,
              author: {
                address: formattedAuthor.address,
              },
            },
          }
        })
      )
    } catch (e) {
      throw PublishingErrors.Parse
    }

    let cid
    try {
      cid = await client.storeBlob(blob)
    } catch (e) {
      throw PublishingErrors.IPFSUpload
    }

    const packageExists = await getPackageVersion({ cid })
    if (packageExists) throw PublishingErrors.AlreadyExists

    // @ts-ignore
    const success = await createPackage({ authorAddress, name, cid, imports })

    if (success) {
      return res.status(200).json({ success: true })
    } else {
      throw PublishingErrors.Database
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: e })
  }
}
