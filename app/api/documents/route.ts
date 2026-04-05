import { NextResponse } from "next/server";
import { createAndProcessDocument, listDocuments } from "@/lib/server/documents-service";

export async function GET() {
  const documents = await listDocuments();
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  const acceptedFiles = files.filter(
    (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
  const rejectedFiles = files
    .filter((file) => !acceptedFiles.includes(file))
    .map((file) => file.name);

  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (acceptedFiles.length === 0) {
    return NextResponse.json(
      { error: "Envie apenas arquivos PDF válidos.", rejectedFiles },
      { status: 400 }
    );
  }

  const createdDocuments = [];

  for (const file of acceptedFiles) {
    createdDocuments.push(await createAndProcessDocument(file));
  }

  return NextResponse.json(
    { documents: createdDocuments.filter(Boolean), rejectedFiles },
    { status: 201 }
  );
}
