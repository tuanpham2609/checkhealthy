/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { SITE_METADATA } from '@/constants/site-metadata.constants'

/**
 * JSON-LD (Schema.org) cho WebSite + Organization + WebApplication — hỗ trợ rich results / hiểu thực thể.
 */
export function SiteJsonLd() {
  const base = SITE_METADATA.siteUrl.replace(/\/$/, '')
  const logoId = `${base}/#logo`
  const shareImageId = `${base}/#og-image`

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        name: SITE_METADATA.titleHeader,
        alternateName: [SITE_METADATA.title, 'Tâm sự thụ tinh trong ống nghiệm', 'cộng đồng IVF Việt Nam'],
        description: SITE_METADATA.description,
        url: base,
        inLanguage: 'vi-VN',
        publisher: { '@id': `${base}/#organization` },
        about: {
          '@type': 'MedicalProcedure',
          name: 'Thụ tinh trong ống nghiệm (IVF)',
          alternateName: 'IVF',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${base}/#webpage`,
        url: base,
        name: SITE_METADATA.title,
        description: SITE_METADATA.description,
        inLanguage: 'vi-VN',
        isPartOf: { '@id': `${base}/#website` },
        primaryImageOfPage: { '@id': logoId },
        about: { '@type': 'MedicalProcedure', name: 'Thụ tinh trong ống nghiệm (IVF)' },
      },
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: SITE_METADATA.titleHeader,
        url: base,
        logo: { '@id': logoId },
      },
      {
        '@type': 'ImageObject',
        '@id': logoId,
        url: SITE_METADATA.siteLogo,
        contentUrl: SITE_METADATA.siteLogo,
      },
      {
        '@type': 'ImageObject',
        '@id': shareImageId,
        url: SITE_METADATA.siteOgImage,
        contentUrl: SITE_METADATA.siteOgImage,
        width: SITE_METADATA.siteOgImageWidth,
        height: SITE_METADATA.siteOgImageHeight,
        caption: SITE_METADATA.siteOgImageAlt,
      },
      {
        '@type': 'WebApplication',
        '@id': `${base}/#webapp`,
        name: SITE_METADATA.titleHeader,
        description: SITE_METADATA.description,
        url: base,
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'VND',
        },
      },
    ],
  }

  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
}
