import { getSession } from 'next-auth/react'
import { getToken } from 'next-auth/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'
import ethers from 'ethers'

enum Errors {
  Unauthorized = 'unauthorized',
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  const token = await getToken({ req })

  const address = token?.sub ?? null
  // await provider.lookupAddress("0x5555763613a12D8F3e73be831DFf8598089d3dCa");

  console.log(address)

  if (session) {
    res.status(200).json({ success: true })
  } else {
    res.status(401).json({ error: Errors.Unauthorized })
  }
}
