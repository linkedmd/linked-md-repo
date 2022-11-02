import { ethers } from 'ethers'
import { chain } from './web3'
import { Author } from './types'

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
const DOMAIN_REGEX =
  /^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/

const provider = providers.WebSocketProvider(
  `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`,
  chain.mainnet.id
)

function sliced(address: string): string {
  return `${address.substring(0, 4)}...${address.slice(-4)}`
}

export async function formatAddressOrEnsName(
  addressOrEnsName: string
): Promise<Author> {
  let author: any = {}
  if (addressOrEnsName.match(ETH_ADDRESS_REGEX)) {
    const ensName = await provider.lookupAddress(addressOrEnsName)
    author = {
      ensName,
      address: addressOrEnsName,
    }
  } else if (addressOrEnsName.match(DOMAIN_REGEX)) {
    const address = await provider.resolveName(addressOrEnsName)
    author = {
      ensName: addressOrEnsName,
      address,
    }
  } else {
    author = {
      address: addressOrEnsName,
    }
  }
  return {
    formatted: author.ensName || sliced(author.address),
    ...author,
  }
}
