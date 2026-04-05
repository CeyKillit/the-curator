import { NextResponse } from "next/server";
import { importCuratedDocument } from "@/lib/server/documents-service";
import type { CuratedDocumentImportPayload } from "@/lib/server/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CuratedDocumentImportPayload;
    const document = await importCuratedDocument(payload);
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Falha ao importar documento curado.",
      },
      { status: 400 }
    );
  }
}
