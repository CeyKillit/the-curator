import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #004ac6 0%, #16a34a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: -3,
            fontFamily: "sans-serif",
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size }
  );
}
