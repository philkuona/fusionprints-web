import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-28 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-mute">
        404
      </p>
      <h1 className="mt-3 font-fraunces text-4xl font-bold text-ink sm:text-5xl">
        This page hasn&rsquo;t been printed yet.
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        The page you&rsquo;re looking for isn&rsquo;t here. Let&rsquo;s get you
        back to something worth keeping.
      </p>
      <Link
        href="/"
        className="mt-8 flex h-11 cursor-pointer items-center rounded-full bg-malachite px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
      >
        Back home
      </Link>
    </Container>
  );
}
