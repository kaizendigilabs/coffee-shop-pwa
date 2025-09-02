import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import useAuthStore from "@/lib/store/auth.store";

export function AuthButton() {
  const { user, isLoggedIn } = useAuthStore((state) => ({
    user: state.user,
    isLoggedIn: state.isLoggedIn,
  }));

  return isLoggedIn ? (
    <div className="flex items-center gap-4">
      Hey, {user?.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
