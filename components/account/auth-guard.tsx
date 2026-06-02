"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, type WebUser } from "@/lib/api/auth";

interface AuthGuardProps {
  children: (user: WebUser) => React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<WebUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
      </div>
    );
  }

  if (!user) return null;
  return <>{children(user)}</>;
}
