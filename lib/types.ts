type FetchPackageParams = {
  authorAddress: string
  name: string
  cid?: string
  imports?: Array<PackageVersion>
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
  package: Package
  createdAt: Date
  dependencies?: Array<PackageVersion>
  dependants?: Array<PackageVersion>
}

enum PublishingErrors {
  Unauthorized = 'unauthorized',
  FileFetch = 'fileFetch',
  Parse = 'parse',
  IPFSUpload = 'ipfsUpload',
  AlreadyExists = 'alreadyExists',
  Database = 'database',
}

export type { FetchPackageParams, Author, Package, PackageVersion }

export { PublishingErrors }
