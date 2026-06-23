"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { syncCartWithServer } from "@/lib/cart";

/**
 * Mounts app-wide. Reconciles the local cart with the signed-in user's saved
 * server cart so it follows them across devices. Re-checks on navigation so it
 * also picks up a just-completed login; it no-ops once sync is active and stays
 * local-only (a cheap 401) while signed out.
 */
export function CartSync() {
  const pathname = usePathname();
  useEffect(() => {
    void syncCartWithServer();
  }, [pathname]);
  return null;
}
