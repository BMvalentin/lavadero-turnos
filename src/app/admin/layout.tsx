import { redirect } from "next/navigation";
import { esAdmin } from "@/lib/esAdmin";
import AdminShell from "@/components/panel/navegacion/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await esAdmin())) redirect("/dashboard");

  return <AdminShell>{children}</AdminShell>;
}
