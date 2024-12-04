import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chain = searchParams.get('chain')
  const sequenceNumber = searchParams.get('sequenceNumber')
  const isMainnet = searchParams.get('isMainnet') === 'true'

  if (!chain || !sequenceNumber) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const baseUrl = isMainnet 
    ? 'https://fortuna.dourolabs.app'
    : 'https://fortuna-staging.dourolabs.app'

  try {
    const url = `${baseUrl}/v1/chains/${chain}/revelations/${sequenceNumber}`
    console.log("url:")
    const response = await fetch(
      url,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      }
    )
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}