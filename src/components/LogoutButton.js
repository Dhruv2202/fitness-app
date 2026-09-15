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
      className="press shrink-0 rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted"
    >
      Log out
    </button>
  );
}
