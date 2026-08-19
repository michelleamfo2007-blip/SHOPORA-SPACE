import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Create client inside the handler so env vars are read at runtime, not build time
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const storeId = formData.get("storeId") as string | null;

    if (!file || !storeId) {
      return Response.json({ error: "File and storeId are required" }, { status: 400 });
    }

    // Verify user is an owner/admin of this store
    const membership = await db.storeMember.findUnique({
      where: { storeId_userId: { storeId, userId: session.user.id } },
    });
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return new Response("Forbidden", { status: 403 });
    }

    // Prepare file
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `media-${storeId}-${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("store-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("store-images")
      .getPublicUrl(fileName);

    return Response.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
