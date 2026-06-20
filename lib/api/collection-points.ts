/** Active pickup locations (admin-managed). */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  hours: string;
}

export async function getCollectionPoints(): Promise<CollectionPoint[]> {
  try {
    const res = await fetch(`${API}/web/api/collection-points`, { credentials: "include" });
    if (!res.ok) return [];
    return (await res.json()) as CollectionPoint[];
  } catch {
    return [];
  }
}
