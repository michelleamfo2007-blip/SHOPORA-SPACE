import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getStoreAccess } from "@/lib/store-access";

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

    const access = await getStoreAccess(storeId);
    if ("error" in access) {
      return new Response(access.error, { status: access.status });
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
      return Response.json({ error: `Supabase error: ${error.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("store-images")
      .getPublicUrl(fileName);

    return Response.json({ url: urlData.publicUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
