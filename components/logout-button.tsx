"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/auth.store";

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
