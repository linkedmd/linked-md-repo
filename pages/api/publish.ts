import { getSession } from 'next-auth/react'
import { getToken } from 'next-auth/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NFTStorage, Blob } from 'nft.storage'
import { createPackage } from '../../lib/database'
import { PublishingErrors } from '../../lib/types'

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

    let cid
    try {
      cid = await client.storeBlob(blob)
    } catch (e) {
      throw PublishingErrors.IPFSUpload
    }

    const success = await createPackage({ name, cid, authorAddress })

    if (success) {
      res.status(200).json({ success: true })
    } else {
      throw PublishingErrors.Database
    }
  } catch (e) {
    return res.status(500).json({ error: e })
  }
}
