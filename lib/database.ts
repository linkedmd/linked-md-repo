import { Neo4jGraphQL } from '@neo4j/graphql'
import { OGM } from '@neo4j/graphql-ogm'
import { ApolloServer, gql } from 'apollo-server'
import neo4j from 'neo4j-driver'
import env from './config'
import { FetchPackageParams } from './types'

const driver = neo4j.driver(
  env('NEO4J_URI'),
  neo4j.auth.basic(env('NEO4J_USERNAME'), env('NEO4J_PASSWORD'))
)

const typeDefs = gql`
  type Author {
    address: String! @unique
    publishedPackages: [Package!]!
      @relationship(type: "PUBLISHED", direction: OUT)
  }
  type Package {
    name: String! @unique
    author: Author! @relationship(type: "PUBLISHED", direction: IN)
    versions: [PackageVersion!]! @relationship(type: "VERSION", direction: IN)
  }
  type PackageVersion {
    package: Package! @relationship(type: "VERSION", direction: OUT)
    cid: String! @unique
    dependencies: [PackageVersion!]!
      @relationship(type: "DEPENDS", direction: OUT)
    dependants: [PackageVersion!]! @relationship(type: "DEPENDS", direction: IN)
    createdAt: DateTime! @timestamp(operations: [CREATE])
  }
`

const neo4jGraphQL = new Neo4jGraphQL({
  typeDefs,
  driver,
})

const ogm = new OGM({
  typeDefs,
  driver,
})

const Author = ogm.model('Author')
const Package = ogm.model('Package')
const PackageVersion = ogm.model('PackageVersion')

ogm.init()

export async function createPackage({
  authorAddress,
  name,
  cid,
  imports
}: FetchPackageParams) {
  const pkg = await Package.find({
    where: {
      name,
      author: { address: authorAddress },
    },
  })
  const dependencies = imports && imports.map((pkgVersion) => ({
    where: {
      node: {
        cid: pkgVersion.cid,
        package: pkgVersion.package,
      }
    }
  }))
  if (pkg[0]) {
    const pkgVersion = await PackageVersion.create({
      input: [
        {
          package: {
            connect: {
              where: {
                node: { name },
              },
            },
          },
          cid,
          dependencies: {
            connect: dependencies
          }
        },
      ],
    })
  } else {
    const pkg = await Package.create({
      input: [
        {
          name,
          author: {
            connectOrCreate: {
              where: { node: { address: authorAddress } },
              onCreate: {
                node: {
                  address: authorAddress,
                },
              },
            },
          },
          versions: {
            create: {
              node: {
                cid,
                dependencies: {
                  connect: dependencies
                }
              },
            },
          },
        },
      ],
    })
  }
  return true
}

export async function getPackage({ authorAddress, name }: FetchPackageParams) {
  const selectionSet = `
    {
      name
      author {
        address
      }
      versions {
        cid
        createdAt
      }
    }
  `
  const pkg = await Package.find({
    where: {
      name,
      author: { address: authorAddress },
    },
    selectionSet,
  })

  return pkg[0] || false
}

export async function getPackages() {
  const selectionSet = `
    {
      name
      author {
        address
      }
      versions {
        cid
        createdAt
      }
    }
  `
  const pkgs = await Package.find({
    selectionSet,
  })

  return pkgs
}

export async function getPackageVersion({ cid }: { cid: string }) {
  const selectionSet = `
    {
      cid
      createdAt
      package {
        name
        author {
          address
        }
      }
      dependencies {
        cid
        package {
          name
          author {
            address
          }
        }
      }
      dependants {
        cid
        package {
          name
          author {
            address
          }
        }
      }
    }
  `
  const pkgVersion = await PackageVersion.find({
    where: {
      cid,
    },
    selectionSet,
  })

  return pkgVersion[0] || false
}

export async function getAuthor({ authorAddress }: { authorAddress: string }) {
  const selectionSet = `
    {
      address
      publishedPackages {
        name
      }
    }
  `
  const pkgVersion = await Author.find({
    where: {
      address: authorAddress,
    },
    selectionSet,
  })

  return pkgVersion[0] || false
}
