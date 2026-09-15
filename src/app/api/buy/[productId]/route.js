import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/data";
import { normalizeUrl } from "@/lib/url";

export async function GET(request, { params }) {
  const { productId } = await params;
  const product = await getProduct(productId);
  const destination = product ? normalizeUrl(product.buy_url) : null;

  if (!destination) {
    return Response.redirect(new URL("/shop", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("product_clicks")
    .insert({ user_id: user?.id ?? null, product_id: product.id });

  return Response.redirect(destination);
}
