import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') ?? 'Fast Websites for Service Businesses'
  const type = searchParams.get('type') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'hsl(220, 20%, 4%)',
          padding: '64px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, hsl(190, 100%, 50%), hsl(260, 80%, 65%))',
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
          {type && (
            <div
              style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                background: 'hsla(190, 100%, 50%, 0.15)',
                border: '1px solid hsla(190, 100%, 50%, 0.3)',
                borderRadius: '6px',
                padding: '6px 14px',
                color: 'hsl(190, 100%, 50%)',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {type}
            </div>
          )}

          <div
            style={{
              fontSize: title.length > 60 ? '44px' : '56px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#ffffff',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid hsla(220, 20%, 60%, 0.2)',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo mark */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, hsl(190, 100%, 50%), hsl(260, 80%, 65%))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontSize: '18px',
                fontWeight: 900,
              }}
            >
              X
            </div>
            <span style={{ color: 'hsl(220, 20%, 70%)', fontSize: '20px', fontWeight: 600 }}>
              Xyren.me
            </span>
          </div>
          <span style={{ color: 'hsl(220, 20%, 50%)', fontSize: '16px' }}>
            Fast websites for service professionals
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
