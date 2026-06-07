"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { AuthGuard } from "@/components/account/auth-guard";
import { Container } from "@/components/ui/container";
import type { CompositeProduct } from "@/lib/composite-products";
import { CompositeEditor } from "./composite-editor";

/**
 * Dedicated composite editor route view — mirrors the photo editor entry: a
 * product page sends the customer here via "Start designing", and the editor
 * itself is auth-gated (sign in to upload / pick from My Photos). Keeps the
 * editor off the public product page so the entry flow matches photo prints.
 */
export function CompositeEditorView({ product }: { product: CompositeProduct }) {
  return (
    <AuthGuard>
      {() => (
        <div className="min-h-screen overflow-x-hidden bg-cream">
          <header className="border-b border-ink/8 bg-cream/80 backdrop-blur-sm">
            <Container className="flex h-16 items-center justify-between">
              <Link href="/" className="shrink-0 cursor-pointer transition-colors duration-200" aria-label="FusionPrints home">
                <Logo className="h-7 w-auto" />
              </Link>
              <Link
                href={`/prints/${product.slug}`}
                className="ml-4 min-w-0 cursor-pointer truncate whitespace-nowrap text-sm font-medium text-ink-mute transition-colors duration-200 hover:text-ink"
              >
                ← Back to {product.displayName}
              </Link>
            </Container>
          </header>

          <Container className="py-8">
            <div className="mb-6">
              <h1 className="text-balance font-fraunces text-2xl font-bold text-ink sm:text-3xl">Design your {product.displayName}</h1>
              <p className="mt-1 text-ink-soft">{product.tagline}</p>
            </div>
            <CompositeEditor product={product} />
          </Container>
        </div>
      )}
    </AuthGuard>
  );
}
