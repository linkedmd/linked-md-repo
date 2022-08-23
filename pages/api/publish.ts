import { getSession } from 'next-auth/react'
import { getToken } from 'next-auth/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NFTStorage, Blob } from 'nft.storage'
import { createPackage } from '../../lib/database'

enum Errors {
  Unauthorized = 'unauthorized',
}

const client = new NFTStorage({
  token: process.env.NFTSTORAGE_KEY || '',
})

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  const token = await getToken({ req })

  const authorAddress = token?.sub ?? null

  const { name, url } = req.body

  const request = await fetch(url)
  const blob = await request.blob()
  const cid = await client.storeBlob(blob)

  const success = await createPackage({ name, cid, authorAddress })

  if (session) {
    res.status(200).json({ success: true })
  } else {
    res.status(401).json({ error: Errors.Unauthorized })
  }
}
