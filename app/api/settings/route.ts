import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getLocalUserId } from "@/lib/server/database";

export async function GET() {
  const userId = getLocalUserId();
  const { data } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", userId)
    .single();

  return NextResponse.json({
    settings: {
      name: (data?.name as string) ?? "Estudante",
      email: (data?.email as string) ?? "",
    },
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  if (!body) return NextResponse.json({ error: "Payload inválido." }, { status: 400 });

  const userId = getLocalUserId();
  const updates: Record<string, unknown> = {};
  if (body.name?.trim()) updates.name = body.name.trim();

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido para atualizar." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("name, email")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: { name: data.name, email: data.email } });
}
