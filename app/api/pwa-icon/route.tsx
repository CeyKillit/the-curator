import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function CuratorIcon({ size }: { size: number }) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.44);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(135deg, #004ac6 0%, #1d6fd8 50%, #16a34a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize,
          fontWeight: 900,
          fontFamily: "sans-serif",
          letterSpacing: -size * 0.02,
          lineHeight: 1,
        }}
      >
        C
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const size = Number(searchParams.get("size") ?? "192");
  const clamped = [192, 512].includes(size) ? size : 192;

  return new ImageResponse(<CuratorIcon size={clamped} />, {
    width: clamped,
    height: clamped,
  });
}
