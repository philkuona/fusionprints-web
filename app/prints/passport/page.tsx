import { redirect } from "next/navigation";

// Passport photos are temporarily stubbed — sizing varies by country/use-case.
// Re-enable by restoring the CompositeProductView render (see git history).
export default function Page() {
  redirect("/prints");
}
