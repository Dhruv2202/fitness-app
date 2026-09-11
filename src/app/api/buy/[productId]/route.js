import { sampleProducts } from "@/data/sampleData";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  const { productId } = await params;
  const product = sampleProducts.find((p) => String(p.id) === productId);

  if (!product) {
    return Response.redirect(new URL("/shop", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("product_clicks")
    .insert({ user_id: user?.id ?? null, product_id: product.id });

  return Response.redirect(product.buyUrl);
}
