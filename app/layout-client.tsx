"use client";

import useAuthStore from "@/lib/store/auth.store";
import { useEffect } from "react";

export default function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const checkUser = useAuthStore((state) => state.checkUser);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return <>{children}</>;
}
