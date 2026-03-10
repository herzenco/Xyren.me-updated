import { siteConfig } from '@/lib/config'

export function JsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logos/xyren-logo-blue.png`,
        image: `${siteConfig.url}/og-image.png`,
        email: siteConfig.contact.email,
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'US', // Defaulting to US, can be updated later
        },
        sameAs: [siteConfig.links.twitter],
        priceRange: '$$',
        potentialAction: {
            '@type': 'ReserveAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteConfig.url}/#contact`,
                description: 'Get a project plan',
            },
            result: {
                '@type': 'Reservation',
                name: 'Project Plan Consultation',
            },
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
