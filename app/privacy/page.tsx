import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy | FusionPrints",
  description: "What information FusionPrints collects, how we use it, and how we look after your photos.",
};

const WA = "https://wa.me/263781387466";

export default function PrivacyPage() {
  return (
    <Container className="max-w-2xl py-14">
      <h1 className="font-fraunces text-4xl font-bold text-ink">Privacy</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        Your photos and your details are yours. Here is plainly what we keep and why.
      </p>

      <section className="mt-10 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">What we collect</h2>
        <p className="text-ink-soft leading-relaxed">
          Your account email, the photos you upload, and the details needed to fulfil an order such
          as your name, delivery area, and order history.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">How we use it</h2>
        <p className="text-ink-soft leading-relaxed">
          Only to print and deliver your order, to keep you updated about it, and to keep your
          account working. We do not sell your information, and we do not share it with anyone who
          is not helping us complete your order.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Your photos</h2>
        <p className="text-ink-soft leading-relaxed">
          Uploaded photos are kept for 90 days so you can reorder, then they are removed
          automatically. You can delete any photo from your account at any time.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-fraunces text-xl font-bold text-ink">Questions</h2>
        <p className="text-ink-soft leading-relaxed">
          Want something removed, or have a question about your data? {" "}
          <a href={WA} target="_blank" rel="noopener noreferrer" className="cursor-pointer font-semibold text-malachite-deep underline underline-offset-2 hover:text-ink">
            Message us on WhatsApp
          </a>{" "}
          and we will help.
        </p>
      </section>
    </Container>
  );
}
