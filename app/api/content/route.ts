import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_content").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map: Record<string, string> = {};
  data?.forEach((item) => { map[item.key] = item.value; });
  return NextResponse.json(map);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = await req.json() as Record<string, string>;

  // Use upsert so it creates the row if it doesn't exist yet
  for (const [key, value] of Object.entries(updates)) {
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value, type: "text" }, { onConflict: "key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Revalidate all public pages that display site_content
  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
