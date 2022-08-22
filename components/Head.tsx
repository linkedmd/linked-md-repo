import Head from 'next/head'

export default function WebsiteHead({ title }: any) {
  const fullTitle = `Linked Markdown packages ${title}`
  const description = 'Repository of Linked Markdown packages'
  const image = ''

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  )
}
