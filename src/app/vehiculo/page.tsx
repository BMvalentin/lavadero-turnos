import { redirect } from "next/navigation";

// Se gestiona ahora desde el panel de administración.
export default function Page() {
  redirect("/admin/vehiculo");
}
