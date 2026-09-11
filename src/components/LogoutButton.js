"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-5 rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-700"
    >
      Log out
    </button>
  );
}
