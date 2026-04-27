import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// GET /api/project-media?project_id=xxx — list all media for a project
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("project_id");
  if (!projectId) return NextResponse.json({ error: "Missing project_id" }, { status: 400 });

  const { data, error } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/project-media — upload a new image for a project
// Expects multipart/form-data with fields: file, project_id, alt_text (optional)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse upload" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const projectId = formData.get("project_id") as string | null;
  const altText = formData.get("alt_text") as string | null;

  if (!file || file.size === 0) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!projectId) return NextResponse.json({ error: "No project_id provided" }, { status: 400 });

  // Get current max sort_order for this project
  const { data: existing } = await supabase
    .from("project_media")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSort = existing && existing.length > 0 ? (existing[0].sort_order + 1) : 0;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const result = await uploadToCloudinary(buffer, "studio/projects");

  const mediaType = file.type.startsWith("video") ? "video" : "image";

  const { data, error } = await supabase
    .from("project_media")
    .insert({
      project_id: projectId,
      media_type: mediaType,
      url: result.url,
      public_id: result.public_id,
      alt_text: altText || null,
      sort_order: nextSort,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Revalidate the project's public page
  const { data: project } = await supabase.from("projects").select("slug").eq("id", projectId).single();
  if (project?.slug) revalidatePath(`/portfolio/${project.slug}`, "page");
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/project-media — update sort_order or alt_text
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await supabase
    .from("project_media")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/portfolio", "page");
  return NextResponse.json(data);
}

// DELETE /api/project-media?id=xxx — delete a media item (and remove from Cloudinary)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Fetch the record first to get public_id for Cloudinary deletion
  const { data: media, error: fetchError } = await supabase
    .from("project_media")
    .select("public_id")
    .eq("id", id)
    .single();

  if (fetchError || !media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from Cloudinary (fire-and-forget — don't block on failure)
  deleteFromCloudinary(media.public_id).catch(console.error);

  const { error } = await supabase.from("project_media").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/portfolio", "page");
  return NextResponse.json({ success: true });
}
