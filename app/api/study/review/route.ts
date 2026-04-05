import { NextResponse } from "next/server";
import { getReviewQueue } from "@/lib/server/study-service";

export async function GET() {
  const questions = await getReviewQueue();
  return NextResponse.json({ questions });
}
