import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafb',
          backgroundImage: 'linear-gradient(135deg, #f0f7f4 0%, #f8fafb 50%, #eef5ff 100%)',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #2A9FD6, #2070DF, #C69239)',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2070DF, #2A9FD6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              fontWeight: 700,
            }}
          >
            W
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#1a1a2e',
              letterSpacing: '-1px',
            }}
          >
            Wisebox
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#1a1a2e',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.3,
            marginBottom: '16px',
          }}
        >
          Building clarity for families who own
          property across borders
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '18px',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          Property management, document vault, and expert consultations
          for the Bangladeshi diaspora
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '16px',
            color: '#94a3b8',
            letterSpacing: '0.5px',
          }}
        >
          mywisebox.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
