import type { Metadata } from "next"

const SITE_NAME = "Not a Second Hand Life"
const CREATOR = "@__SurajSingh__"
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630 }

interface PageMetadataInput {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogImageAlt?: string
}

interface ArticleMetadataInput extends PageMetadataInput {
  keywords?: string[]
}

export function pageMetadata({ title, description, path, ogImageAlt }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: SITE_NAME,
      images: [{ ...OG_IMAGE, alt: ogImageAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: CREATOR,
      images: [OG_IMAGE.url],
    },
  }
}

export function articleMetadata({
  title,
  description,
  path,
  keywords,
  ogImageAlt,
}: ArticleMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    authors: [{ name: "Suraj Singh" }],
    keywords,
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      siteName: SITE_NAME,
      images: [{ ...OG_IMAGE, alt: ogImageAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: CREATOR,
      images: [OG_IMAGE.url],
    },
  }
}
