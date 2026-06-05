import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Delivery & Collection | FusionPrints",
  description: "How collection and delivery work at FusionPrints, and how long your order takes.",
};

const WA = "https://wa.me/263781387466";

export default function ShippingPage() {
  return (
    <Container className="max-w-2xl py-14">
      <h1 className="font-fraunces text-4xl font-bold text-ink">Delivery & collection</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        We print everything ourselves, so your order moves fast. Here is how you get it.
      </p>

      <section className="mt-10 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">How long it takes</h2>
        <p className="text-ink-soft leading-relaxed">
          Most orders are ready within 24 hours, sometimes less. Larger wall art can take a little
          longer. We let you know the moment your order is ready.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Collection</h2>
        <p className="text-ink-soft leading-relaxed">
          Collection is free. Once your order is printed and checked, we send you the details so you
          can pick it up at a time that suits you.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Delivery</h2>
        <p className="text-ink-soft leading-relaxed">
          Prefer it brought to you? Choose delivery at checkout and pick your area. The delivery fee
          is shown before you pay, so there are no surprises. For areas further out, we quote
          delivery separately and confirm it with you first.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Need a hand?</h2>
        <p className="text-ink-soft leading-relaxed">
          Questions about your order or a delivery area? {" "}
          <a href={WA} target="_blank" rel="noopener noreferrer" className="cursor-pointer font-semibold text-malachite-deep underline underline-offset-2 hover:text-ink">
            Message us on WhatsApp
          </a>{" "}
          and we will sort it out.
        </p>
      </section>

      <div className="mt-12 border-t border-ink/10 pt-6">
        <Link href="/prints" className="cursor-pointer text-sm font-semibold text-malachite-deep transition-colors duration-200 hover:text-ink">
          Start printing
        </Link>
      </div>
    </Container>
  );
}
