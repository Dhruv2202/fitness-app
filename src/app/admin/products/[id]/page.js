import { redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getAdminUser } from "@/lib/admin";
import { getProduct } from "@/lib/data";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/profile");

  const { id } = await params;
  const product = await getProduct(id);
  if (!product) redirect("/admin");

  return <ProductForm product={product} />;
}
