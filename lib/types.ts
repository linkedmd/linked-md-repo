type FetchPackageParams = {
  name: string
  cid?: string
  authorAddress: string
}

type Author = {
  address: string
  formatted: string
  ensName?: string | null
  publishedPackages: Array<Package>
}

type Package = {
  name: string
  author: Author
  versions: Array<PackageVersion>
}

type PackageVersion = {
  cid: string
  createdAt: Date
  package: Package
}

enum PublishingErrors {
  Unauthorized = 'unauthorized',
  FileFetch = 'fileFetch',
  IPFSUpload = 'ipfsUpload',
  Database = 'database',
}

export type { FetchPackageParams, Author, Package, PackageVersion }

export { PublishingErrors }
