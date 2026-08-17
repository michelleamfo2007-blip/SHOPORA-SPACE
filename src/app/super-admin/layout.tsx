import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { SuperAdminNav } from "@/components/admin/nav";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.platformRole !== "SUPER_ADMIN") {
    redirect("/"); // Redirect unauthorized users away
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SuperAdminNav />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
