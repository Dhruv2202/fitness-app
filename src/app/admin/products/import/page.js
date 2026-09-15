import { redirect } from "next/navigation";
import BulkProducts from "@/components/BulkProducts";
import { getAdminUser } from "@/lib/admin";

export const metadata = { title: "Add several products" };

// Reading several shop pages takes longer than a normal request.
export const maxDuration = 60;

export default async function ImportProductsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  return <BulkProducts />;
}
