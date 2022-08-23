import { ethers } from 'ethers'
import { chain } from './web3'

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
const DOMAIN_REGEX =
  /^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/

const provider = ethers.getDefaultProvider(chain.mainnet.id, {
  alchemy: process.env.ALCHEMY_ID,
})

export async function formatAddressOrEnsName(addressOrEnsName) {
  if (addressOrEnsName.match(ETH_ADDRESS_REGEX)) {
    const ensName = await provider.lookupAddress(addressOrEnsName)
    return { ensName, address: addressOrEnsName }
  } else if (addressOrEnsName.match(DOMAIN_REGEX)) {
    const address = await provider.resolveName(addressOrEnsName)
    return { ensName: addressOrEnsName, address }
  } else {
    return { address: addressOrEnsName }
  }
}
