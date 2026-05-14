import { getSession } from "@/lib/auth";
import DashboardLayoutShell from "@/components/layout/DashboardLayoutShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isAdmin = session?.role === "SUPER_ADMIN";

  return (
    <DashboardLayoutShell isAdmin={isAdmin}>{children}</DashboardLayoutShell>
  );
}
