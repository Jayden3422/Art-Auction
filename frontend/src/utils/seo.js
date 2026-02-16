const SITE_NAME = 'Jayden Art Auction'
const DEFAULT_DESCRIPTION = 'Jayden Art Auction - Professional online art auction platform featuring paintings, calligraphy, ceramics, sculptures, metalwork, and rare stones.'
const DEFAULT_KEYWORDS = 'art auction,online bidding,painting auction,ceramic auction,sculpture auction,art trading'

/**
 * Set or update a meta tag dynamically
 * @param {string} attr - Attribute type ('name' or 'property')
 * @param {string} key - Attribute value (e.g. 'description', 'og:title')
 * @param {string} content - Meta content
 */
export function setMetaTag(attr, key, content) {
    if (!content) return
    let element = document.querySelector(`meta[${attr}="${key}"]`)
    if (element) {
        element.setAttribute('content', content)
    } else {
        element = document.createElement('meta')
        element.setAttribute(attr, key)
        element.setAttribute('content', content)
        document.head.appendChild(element)
    }
}

/**
 * Set or update the canonical URL link element
 * @param {string} path - Current route path
 */
export function setCanonicalUrl(path) {
    const url = window.location.origin + path
    let link = document.querySelector('link[rel="canonical"]')
    if (link) {
        link.setAttribute('href', url)
    } else {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        link.setAttribute('href', url)
        document.head.appendChild(link)
    }
}

/**
 * Set or update hreflang link elements for en/zh + x-default
 * @param {string} path - Current route path (without query)
 */
export function setHreflang(path) {
    const origin = window.location.origin
    const langs = [
        { hreflang: 'en', href: `${origin}${path}?lang=en` },
        { hreflang: 'zh', href: `${origin}${path}?lang=zh` },
        { hreflang: 'x-default', href: `${origin}${path}` }
    ]
    // Remove old hreflang links
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove())
    // Add new ones
    langs.forEach(({ hreflang, href }) => {
        const link = document.createElement('link')
        link.setAttribute('rel', 'alternate')
        link.setAttribute('hreflang', hreflang)
        link.setAttribute('href', href)
        document.head.appendChild(link)
    })
}

/**
 * Batch update page SEO info based on route meta
 * @param {object} meta - Route meta object
 * @param {string} fullPath - Current route full path (with query)
 * @param {string} path - Current route path (without query)
 */
export function updateRouteMeta(meta, fullPath, path) {
    const title = meta.title || SITE_NAME
    const description = meta.description || DEFAULT_DESCRIPTION
    const keywords = meta.keywords || DEFAULT_KEYWORDS

    document.title = title
    setMetaTag('name', 'description', description)
    setMetaTag('name', 'keywords', keywords)
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    if (fullPath) setCanonicalUrl(fullPath)
    if (path) setHreflang(path)
}

/**
 * Inject JSON-LD structured data (auto-removes old to prevent duplicates)
 * @param {object} data - JSON-LD data object or array of objects
 */
export function setJsonLd(data) {
    // Remove all existing JSON-LD scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove())

    const items = Array.isArray(data) ? data : [data]
    items.forEach(item => {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.textContent = JSON.stringify(item)
        document.head.appendChild(script)
    })
}

/**
 * Build auction item JSON-LD structured data (Schema.org Product + Offer)
 * Compliant with Google Rich Results requirements:
 * - name, image, offers required
 * - offers.url must match canonical
 * - availability uses schema.org enum
 * @param {object} goodInfo - Product info object
 */
export function buildAuctionJsonLd(goodInfo) {
    const now = new Date()
    const startTime = new Date(goodInfo.START_TIME)
    const endTime = new Date(goodInfo.END_TIME)
    const canonicalUrl = `${window.location.origin}/home/detail?GOOD_ID=${goodInfo.GOOD_ID}`

    // Availability mapping: PreOrder → InStock → SoldOut/Discontinued
    let availability, itemAvailabilityEnds
    if (goodInfo.GOOD_STATE) {
        // Ended with no buyer
        availability = 'https://schema.org/Discontinued'
    } else if (endTime < now) {
        // Ended, sold
        availability = 'https://schema.org/SoldOut'
    } else if (startTime > now) {
        // Not started yet
        availability = 'https://schema.org/PreOrder'
    } else {
        // Currently active
        availability = 'https://schema.org/InStock'
        itemAvailabilityEnds = endTime.toISOString()
    }

    const currentPrice = goodInfo.PRICE || goodInfo.UPSET_PRICE || 0

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': goodInfo.NAME,
        'description': goodInfo.INTRODUCTION || '',
        'image': goodInfo.IMG_URL || '',
        'url': canonicalUrl,
        'sku': String(goodInfo.GOOD_ID || ''),
        'brand': {
            '@type': 'Brand',
            'name': goodInfo.ARTIST || 'Unknown Artist'
        },
        'offers': {
            '@type': 'Offer',
            'url': canonicalUrl,
            'priceCurrency': 'CNY',
            'price': currentPrice,
            'availability': availability,
            'validFrom': startTime.toISOString(),
            'seller': {
                '@type': 'Organization',
                'name': SITE_NAME,
                'url': window.location.origin
            }
        }
    }

    if (itemAvailabilityEnds) {
        jsonLd.offers.availabilityEnds = itemAvailabilityEnds
    }
    if (goodInfo.CERTIFICATE) {
        jsonLd.productID = goodInfo.CERTIFICATE
    }

    return jsonLd
}

/**
 * Build website-level JSON-LD structured data (Schema.org WebSite)
 */
export function buildWebsiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': SITE_NAME,
        'description': DEFAULT_DESCRIPTION,
        'inLanguage': 'en'
    }
}

/**
 * Build organization JSON-LD structured data (Schema.org Organization)
 */
export function buildOrganizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': SITE_NAME,
        'description': DEFAULT_DESCRIPTION,
        'url': window.location.origin
    }
}

/**
 * Build ItemList JSON-LD structured data for auction listing pages
 * @param {Array} items - Array of goods objects
 */
export function buildItemListJsonLd(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'Auction Listings',
        'numberOfItems': items.length,
        'itemListElement': items.slice(0, 50).map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'item': {
                '@type': 'Product',
                'name': item.NAME,
                'image': item.IMG_URL || '',
                'description': item.INTRODUCTION || '',
                'offers': {
                    '@type': 'Offer',
                    'priceCurrency': 'CNY',
                    'price': item.UPSET_PRICE || 0
                }
            }
        }))
    }
}
