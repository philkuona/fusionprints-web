"use client";

import Link from "next/link";
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
          <Container className="py-8">
            <Link
              href={`/prints/${product.slug}`}
              className="inline-block cursor-pointer text-sm font-medium text-ink-mute transition-colors duration-200 hover:text-ink"
            >
              ← Back to {product.displayName}
            </Link>
            <div className="mb-6 mt-4">
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
