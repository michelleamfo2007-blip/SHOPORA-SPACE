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
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-950 md:flex-row">
      <SuperAdminNav />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
