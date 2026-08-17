import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.platformRole === "SUPER_ADMIN") {
    redirect("/super-admin");
  }

  // Check if they are a member of any store
  const storeMember = await db.storeMember.findFirst({
    where: { userId: session.user.id },
  });

  if (storeMember) {
    redirect(`/${storeMember.storeId}`);
  } else {
    redirect("/onboarding");
  }
}
