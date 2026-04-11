import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Suraj Singh — Software Engineer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px 80px",
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top rule */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "#171717" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "20px", color: "#737373", margin: 0, letterSpacing: "0.05em" }}>
            Experienced Full Stack Developer
          </p>
          <h1 style={{ fontSize: "64px", fontWeight: 700, color: "#171717", margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Suraj Singh
          </h1>
          <p style={{ fontSize: "28px", color: "#525252", margin: 0, fontWeight: 400 }}>
            Specializing in React, Node.js, and Next.js | Passionate about Building Seamless User Experiences and Scalable Solutions
          </p>
        </div>
      </div>
    ),
    { ...size }
  )
}
