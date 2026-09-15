import { redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getAdminUser } from "@/lib/admin";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  return <ProductForm />;
}
