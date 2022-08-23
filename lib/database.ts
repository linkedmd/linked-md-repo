import { Neo4jGraphQL } from '@neo4j/graphql'
import { OGM } from '@neo4j/graphql-ogm'
import { ApolloServer, gql } from 'apollo-server'
import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
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
    depencendies: [PackageVersion!]!
      @relationship(type: "DEPENDS", direction: OUT)
    dependents: [PackageVersion!]! @relationship(type: "DEPENDS", direction: IN)
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

export async function createPackage({ name, cid, authorAddress }) {
  const pkg = await Package.find({
    name,
    author: { address: authorAddress },
  })
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
        },
      ],
    })
    console.log(pkgVersion)
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
              },
            },
          },
        },
      ],
    })
    console.log(pkg)
  }
  return true
}

export async function getPackage({ authorAddress, name }) {
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

export async function getPackageVersion({ authorAddress, name, cid }) {
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
    }
  `
  const pkgVersion = await PackageVersion.find({
    where: {
      package: { name, author: { address: authorAddress } },
      cid,
    },
    selectionSet,
  })

  return pkgVersion[0] || false
}

export async function getAuthor({ authorAddress }) {
  console.log(authorAddress)
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