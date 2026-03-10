import { BetaAnalyticsDataClient } from '@google-analytics/data'

// Initialize GA4 client
const client = new BetaAnalyticsDataClient({
  projectId: process.env.GA4_PROJECT_ID,
  credentials: {
    private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GA4_CLIENT_EMAIL,
    type: 'service_account',
  },
})

const propertyId = process.env.NEXT_PUBLIC_GA4_PROPERTY_ID

// Helper function to get date range
function getDateRange(days: number) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  }
}

// Get core metrics
export async function getCoreMetrics(days: number = 7) {
  try {
    const dateRange = getDateRange(days)

    const response = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    })

    const row = response[0].rows?.[0]
    if (!row) return null

    return {
      users: row.metricValues?.[0]?.value || '0',
      sessions: row.metricValues?.[1]?.value || '0',
      pageViews: row.metricValues?.[2]?.value || '0',
      bounceRate: (parseFloat(row.metricValues?.[3]?.value || '0') * 100).toFixed(1),
      avgSessionDuration: parseFloat(row.metricValues?.[4]?.value || '0').toFixed(1),
    }
  } catch (error) {
    console.error('GA4 Core Metrics Error:', error)
    return null
  }
}

// Get visitor trends
export async function getVisitorTrends(days: number = 7) {
  try {
    const dateRange = getDateRange(days)

    const response = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      ],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      dimensions: [{ name: 'date' }],
      orderBys: [{ dimension: { orderType: 'ALPHANUMERIC', dimensionName: 'date' } }],
    })

    return response[0].rows?.map((row) => ({
      date: formatDate(row.dimensionValues?.[0]?.value || ''),
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    })) || []
  } catch (error) {
    console.error('GA4 Visitor Trends Error:', error)
    return []
  }
}

// Get top pages
export async function getTopPages(days: number = 7, limit: number = 10) {
  try {
    const dateRange = getDateRange(days)

    const response = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      ],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      dimensions: [{ name: 'pagePath' }],
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true,
        },
      ],
      limit,
    })

    return response[0].rows?.map((row) => ({
      page: row.dimensionValues?.[0]?.value || '/',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
    })) || []
  } catch (error) {
    console.error('GA4 Top Pages Error:', error)
    return []
  }
}

// Get traffic source
export async function getTrafficSource(days: number = 7) {
  try {
    const dateRange = getDateRange(days)

    const response = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      ],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      dimensions: [{ name: 'sessionSource' }],
      orderBys: [
        {
          metric: { metricName: 'activeUsers' },
          desc: true,
        },
      ],
    })

    return response[0].rows?.map((row) => ({
      source: row.dimensionValues?.[0]?.value || 'Direct',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    })) || []
  } catch (error) {
    console.error('GA4 Traffic Source Error:', error)
    return []
  }
}

// Get device breakdown
export async function getDeviceBreakdown(days: number = 7) {
  try {
    const dateRange = getDateRange(days)

    const response = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      ],
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'deviceCategory' }],
      orderBys: [
        {
          metric: { metricName: 'activeUsers' },
          desc: true,
        },
      ],
    })

    return response[0].rows?.map((row) => ({
      device: row.dimensionValues?.[0]?.value || 'Other',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || []
  } catch (error) {
    console.error('GA4 Device Breakdown Error:', error)
    return []
  }
}

// Get geographic data
export async function getGeographicData(days: number = 7, limit: number = 10) {
  try {
    const dateRange = getDateRange(days)

    const response = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      ],
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'country' }],
      orderBys: [
        {
          metric: { metricName: 'activeUsers' },
          desc: true,
        },
      ],
      limit,
    })

    return response[0].rows?.map((row) => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || []
  } catch (error) {
    console.error('GA4 Geographic Data Error:', error)
    return []
  }
}

// Helper to format date
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr
  return `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}/${dateStr.substring(0, 4)}`
}
