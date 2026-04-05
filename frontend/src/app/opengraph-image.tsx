import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Wisebox | Property Management for Diaspora Families";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Left panel — dark with headline */}
        <div
          style={{
            background: "#1C1B22",
            width: "58%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 64px",
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              color: "#3B8F7A",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 36,
            }}
          >
            WISEBOX
          </div>

          {/* Headline */}
          <div
            style={{
              color: "#FAF9F7",
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.18,
              marginBottom: 28,
            }}
          >
            Your property back home deserves better than a WhatsApp group.
          </div>

          {/* Subtext */}
          <div
            style={{
              color: "#8FC4B7",
              fontSize: 19,
              lineHeight: 1.5,
            }}
          >
            Document tracking · Consultant workflows · Secure collaboration
          </div>

          {/* URL badge */}
          <div
            style={{
              marginTop: 44,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 3,
                background: "#3B8F7A",
                borderRadius: 2,
              }}
            />
            <div style={{ color: "#706F76", fontSize: 15 }}>
              mywisebox.com
            </div>
          </div>
        </div>

        {/* Right panel — teal gradient */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(145deg, #3B8F7A 0%, #1A443A 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 40px",
            gap: 24,
          }}
        >
          {/* Stat cards */}
          {[
            { value: "15 min", label: "to first assessment" },
            { value: "72%", label: "readiness improvement" },
            { value: "4", label: "countries supported" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14,
                padding: "20px 28px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  color: "#FAF9F7",
                  fontSize: 34,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 14,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
