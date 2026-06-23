import { redirect } from "next/navigation";

// Mini prints are now designed in the unified editor (same flow as every other
// product). This legacy /create route redirects into it.
export default function Page() {
  redirect("/editor/new?product=mini");
}
