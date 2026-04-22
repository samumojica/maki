import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Maki — Core Web Vitals Checker'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          borderTop: '20px solid #268ad8',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              backgroundColor: '#268ad8',
              color: 'white',
              fontSize: '100px',
              fontWeight: 'bold',
              width: '150px',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '30px',
              marginRight: '30px',
              boxShadow: '0 20px 40px rgba(38, 138, 216, 0.3)',
            }}
          >
            M
          </div>
          <div style={{ fontSize: '120px', fontWeight: 900, color: '#282f42', letterSpacing: '-4px' }}>
            Maki
          </div>
        </div>
        
        <div
          style={{
            fontSize: '50px',
            fontWeight: 700,
            color: '#475569',
            textAlign: 'center',
            maxWidth: '1000px',
            lineHeight: 1.2,
            letterSpacing: '-1px'
          }}
        >
          Core Web Vitals Checker & Tailored Reports
        </div>
        
        <div style={{ display: 'flex', gap: '30px', marginTop: '60px' }}>
          <div style={{ fontSize: '32px', color: '#268ad8', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            ✓ No Account
          </div>
          <div style={{ fontSize: '32px', color: '#268ad8', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            ✓ No Login
          </div>
          <div style={{ fontSize: '32px', color: '#268ad8', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            ✓ One-time $9
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
