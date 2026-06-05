import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Terms | FusionPrints",
  description: "The simple terms for using FusionPrints.",
};

const WA = "https://wa.me/263781387466";

export default function TermsPage() {
  return (
    <Container className="max-w-2xl py-14">
      <h1 className="font-fraunces text-4xl font-bold text-ink">Terms</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        The short version of how using FusionPrints works.
      </p>

      <section className="mt-10 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Your photos stay yours</h2>
        <p className="text-ink-soft leading-relaxed">
          You keep all rights to the photos you upload. You give us permission to use them only to
          print and deliver your order. You confirm you have the right to print what you send us.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Orders and payment</h2>
        <p className="text-ink-soft leading-relaxed">
          Prices are shown before you pay. An order is confirmed once payment is received, after
          which we begin printing. We check every print by hand, and if something is not right, we
          will make it right.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Fair use</h2>
        <p className="text-ink-soft leading-relaxed">
          Please do not upload anything illegal, or anything you do not have the right to print. We
          may decline an order that breaks this.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Changes</h2>
        <p className="text-ink-soft leading-relaxed">
          We may update these terms as the service grows. Questions in the meantime? {" "}
          <a href={WA} target="_blank" rel="noopener noreferrer" className="cursor-pointer font-semibold text-malachite-deep underline underline-offset-2 hover:text-ink">
            Message us on WhatsApp
          </a>.
        </p>
      </section>
    </Container>
  );
}
