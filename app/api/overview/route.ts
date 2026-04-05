import { NextResponse } from "next/server";
import { getDashboardOverview } from "@/lib/server/documents-service";

export async function GET() {
  const overview = await getDashboardOverview();
  return NextResponse.json({ overview });
}
