import { NextResponse } from "next/server";
import { getFullUser } from "@/lib/server/study-service";
import { supabase } from "@/lib/supabase/server";
import { getLocalUserId } from "@/lib/server/database";

export async function GET() {
  try {
    const data = await getFullUser();
    if (!data) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const today = new Date().toISOString().slice(0, 10);
    const mission = data.dailyMissions.find((m) => m.date === today) ?? null;

    return NextResponse.json({
      user: {
        id: data.id,
        name: data.name,
        xp: data.xp,
        streak: data.streak,
        coins: data.coins,
        lastStudyDate: data.lastStudyDate,
      },
      dailyMission: mission,
      achievements: data.achievements,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar usuário." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      xp?: number;
      coins?: number;
    };

    const userId = getLocalUserId();
    const { data: userRow } = await supabase
      .from("users")
      .select("xp, coins, streak, name")
      .eq("id", userId)
      .single();

    if (!userRow) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const updates: Record<string, unknown> = {};
    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.xp !== undefined) updates.xp = Math.max(0, (userRow.xp as number) + payload.xp);
    if (payload.coins !== undefined) updates.coins = Math.max(0, (userRow.coins as number) + payload.coins);

    const { data: updated } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("id, name, xp, streak, coins")
      .single();

    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar usuário." },
      { status: 500 }
    );
  }
}
