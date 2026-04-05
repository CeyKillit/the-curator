import { readDocumentFile } from "@/lib/server/documents-service";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const file = await readDocumentFile(id);

  if (!file) {
    return new Response("Arquivo não encontrado.", { status: 404 });
  }

  // Redireciona para a URL pública do Supabase Storage
  return NextResponse.redirect(file.redirectUrl);
}
