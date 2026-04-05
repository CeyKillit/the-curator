import { NextResponse } from "next/server";
import { getTrailOverview } from "@/lib/server/study-service";

export async function GET() {
  const trails = await getTrailOverview();
  return NextResponse.json({ trails });
}
