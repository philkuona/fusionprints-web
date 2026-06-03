import type { EditPayload } from "@/lib/edit/payload-schema";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface ApplyResult {
  id: string;
  processedUrl: string;
  width: number;
  height: number;
}

/** POST an edit payload to the server applier; returns the print-ready render. */
export async function applyEdit(payload: EditPayload): Promise<ApplyResult> {
  const res = await fetch(`${API}/web/api/editor/apply`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as ApplyResult;
}
