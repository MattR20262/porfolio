import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

// Allow large image uploads (50 MB)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse upload — ensure the file is attached correctly" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await uploadToCloudinary(buffer, "studio");

  const { data, error } = await supabase.from("media_assets").insert({
    filename: file.name,
    url: result.url,
    public_id: result.public_id,
    resource_type: file.type.startsWith("video") ? "video" : "image",
    format: result.format,
    size: file.size,
    width: result.width ?? null,
    height: result.height ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get("public_id");
  if (!publicId) return NextResponse.json({ error: "Missing public_id" }, { status: 400 });

  await deleteFromCloudinary(publicId);
  return NextResponse.json({ success: true });
}
