"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { AuthGuard } from "@/components/account/auth-guard";
import { getPhotos, uploadPhoto, type Photo } from "@/lib/api/photos";
import { getCatalog, formatPrice, type CatalogProduct } from "@/lib/api/catalog";
import { type Orientation, orientedAspect, defaultOrientation } from "@/lib/editor/sizes";
import { type Rect } from "@/lib/edit/crop-math";
import {
  type EditPayload,
  type EditAdjustments,
  type FilterId,
  type Rotation,
  EDIT_SCHEMA_VERSION,
} from "@/lib/edit/payload-schema";
import { applyEdit } from "@/lib/api/editor";
import { addToCart, type CartItem } from "@/lib/cart";
import { CropModal, type SavePayloadParts } from "@/components/editor/crop-modal";
import { Dropdown } from "@/components/editor/dropdown";

const ACCEPT = "image/jpeg,image/png,image/tiff,image/webp,image/heic,image/heif";

interface LineItem {
  photoId: string;
  sizeCode: string;
  qty: number;
  orientation: Orientation;
  rotation?: Rotation;
  flipH?: boolean;
  flipV?: boolean;
  crop?: Rect;
  adjustments?: EditAdjustments;
  autoEnhance?: boolean;
  filterId?: FilterId;
  processedUrl?: string; // server-rendered print-ready preview after Save
}

const keyOf = (photoId: string, sizeCode: string) => `${photoId}:${sizeCode}`;

export default function EditorPage({ params }: { params: Promise<{ photoId: string }> }) {
  const { photoId } = use(params);
  return <AuthGuard>{() => <EditorScreen entryPhotoId={photoId} />}</AuthGuard>;
}

function EditorScreen({ entryPhotoId }: { entryPhotoId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [activeSizeCode, setActiveSizeCode] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Record<string, LineItem>>({});
  const [paperByKey, setPaperByKey] = useState<Record<string, "glossy" | "satin">>({});
  const [borderByKey, setBorderByKey] = useState<Record<string, boolean>>({});
  const [focused, setFocused] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [addedNote, setAddedNote] = useState<string | null>(null);
  const [view, setView] = useState<"editor" | "summary">("editor");
  const [sizeModalOpen, setSizeModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, cat] = await Promise.all([getPhotos(), getCatalog()]);
        if (cancelled) return;
        if (cat.length === 0) {
          setStatus("error");
          return;
        }
        const active = list.find((p) => p.id === entryPhotoId)?.id ?? list[0]?.id ?? null;
        const initialSize =
          cat.find((p) => p.sizeCode === "8x10")?.sizeCode ||
          cat.find((p) => p.productType === "photo_print")?.sizeCode ||
          cat[0].sizeCode;
        setPhotos(list);
        setCatalog(cat);
        setActivePhotoId(active);
        setActiveSizeCode(initialSize);
        setSelected(active ? new Set([active]) : new Set());
        setStatus(list.length > 0 ? "ready" : "error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entryPhotoId]);

  const priceOf = useCallback(
    (sizeCode: string) => catalog.find((p) => p.sizeCode === sizeCode)?.unitPriceUsd ?? 0,
    [catalog],
  );
  const labelOf = useCallback(
    (sizeCode: string) => catalog.find((p) => p.sizeCode === sizeCode)?.labelInches ?? sizeCode,
    [catalog],
  );
  const printCountOf = useCallback(
    (photoId: string) =>
      Object.values(items)
        .filter((it) => it.photoId === photoId)
        .reduce((n, it) => n + it.qty, 0),
    [items],
  );
  const subtotal = Object.values(items).reduce((sum, it) => sum + it.qty * priceOf(it.sizeCode), 0);
  const totalPrints = Object.values(items).reduce((n, it) => n + it.qty, 0);

  const handleUpload = useCallback((files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/") || ACCEPT.includes(f.type));
    for (const file of imgs) {
      setUploading((n) => n + 1);
      uploadPhoto(file)
        .then((created) => {
          const photo: Photo = {
            id: created.id,
            storageUrl: created.storageUrl,
            originalFilename: file.name,
            widthPx: created.widthPx,
            heightPx: created.heightPx,
            fileSizeBytes: created.fileSizeBytes,
            format: created.format,
            uploadedAt: new Date().toISOString(),
          };
          setPhotos((prev) => [photo, ...prev]);
          setActivePhotoId(photo.id);
          setSelected((prev) => new Set(prev).add(photo.id));
        })
        .catch(() => {})
        .finally(() => setUploading((n) => Math.max(0, n - 1)));
    }
  }, []);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addSize(sizeCode: string) {
    const targets = selected.size > 0 ? [...selected] : activePhotoId ? [activePhotoId] : [];
    if (targets.length === 0) return;
    setItems((prev) => {
      const next = { ...prev };
      for (const pid of targets) {
        const k = keyOf(pid, sizeCode);
        if (!next[k]) {
          const photo = photos.find((p) => p.id === pid);
          next[k] = {
            photoId: pid,
            sizeCode,
            qty: 1,
            orientation: photo ? defaultOrientation(sizeCode, photo) : "portrait",
          };
        }
      }
      return next;
    });
    setActiveSizeCode(sizeCode);
    setAddedNote(null);
  }

  function setQty(photoId: string, sizeCode: string, qty: number) {
    setItems((prev) => {
      const next = { ...prev };
      const k = keyOf(photoId, sizeCode);
      if (qty <= 0) delete next[k];
      else if (next[k]) next[k] = { ...next[k], qty };
      else {
        const photo = photos.find((p) => p.id === photoId);
        next[k] = { photoId, sizeCode, qty, orientation: photo ? defaultOrientation(sizeCode, photo) : "portrait" };
      }
      return next;
    });
    setAddedNote(null);
  }

  /** Build the payload, render it server-side, and store the result on the item. */
  async function saveCrop(parts: SavePayloadParts) {
    if (!activePhotoId || !activeSizeCode) return;
    const photoId = activePhotoId;
    const sizeCode = activeSizeCode;
    const k = keyOf(photoId, sizeCode);
    const product = catalog.find((p) => p.sizeCode === sizeCode);
    const isPhoto = product?.productType === "photo_print";
    const payload: EditPayload = {
      schemaVersion: EDIT_SCHEMA_VERSION,
      sourceImageId: photoId,
      sizeCode,
      crop: { ...(parts.crop ?? { x: 0, y: 0, width: 1, height: 1 }), orientation: parts.orientation },
      rotate: parts.rotation,
      flipH: parts.flipH,
      flipV: parts.flipV,
      adjustments: parts.adjustments,
      autoEnhance: parts.autoEnhance,
      filterId: parts.filterId,
      border: borderByKey[k] ?? false,
      paper: paperByKey[k] ?? (isPhoto ? "glossy" : "lustre"),
    };

    // Throws on failure → CropModal shows the error and stays open.
    const result = await applyEdit(payload);

    setItems((prev) => {
      const next = { ...prev };
      const existing = next[k];
      next[k] = {
        photoId,
        sizeCode,
        qty: existing?.qty ?? 1,
        orientation: parts.orientation,
        rotation: parts.rotation,
        flipH: parts.flipH,
        flipV: parts.flipV,
        crop: parts.crop ?? undefined,
        adjustments: parts.adjustments,
        autoEnhance: parts.autoEnhance,
        filterId: parts.filterId,
        processedUrl: result.processedUrl,
      };
      return next;
    });
    setFocused(false);
    setAddedNote(null);
  }

  function commitToCart() {
    const cartItems: CartItem[] = Object.values(items).map((it) => {
      const photo = photos.find((p) => p.id === it.photoId);
      const k = keyOf(it.photoId, it.sizeCode);
      const isPhoto = catalog.find((p) => p.sizeCode === it.sizeCode)?.productType === "photo_print";
      return {
        id: k,
        photoId: it.photoId,
        storageUrl: photo?.storageUrl ?? "",
        sizeCode: it.sizeCode,
        label: labelOf(it.sizeCode),
        qty: it.qty,
        unitPriceUsd: priceOf(it.sizeCode),
        paper: paperByKey[k] ?? (isPhoto ? "glossy" : "lustre"),
        border: borderByKey[k] ?? false,
      };
    });
    if (cartItems.length === 0) return;
    addToCart(cartItems);
    setAddedNote(`Added ${totalPrints} print${totalPrints === 1 ? "" : "s"} to your cart.`);
    setItems({});
    setView("editor");
  }

  /** From the summary: jump into focus mode for a specific line item. */
  function editItem(photoId: string, sizeCode: string) {
    setActivePhotoId(photoId);
    setActiveSizeCode(sizeCode);
    setFocused(true);
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
      </div>
    );
  }

  const activePhoto = photos.find((p) => p.id === activePhotoId) ?? null;
  const activeProduct = catalog.find((p) => p.sizeCode === activeSizeCode) ?? null;

  if (status === "error" || !activePhoto || !activeProduct) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-fraunces text-2xl font-bold text-ink">Nothing to edit yet</h1>
        <p className="mt-2 text-sm text-ink-mute">Upload a photo from My Photos to start making prints.</p>
        <Link
          href="/account/photos"
          className="mt-6 inline-flex h-11 cursor-pointer items-center rounded-full bg-malachite px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
        >
          Go to My Photos
        </Link>
      </div>
    );
  }

  const activeKey = keyOf(activePhoto.id, activeProduct.sizeCode);
  const activeItem = items[activeKey];
  const activeOrientation: Orientation =
    activeItem?.orientation ?? defaultOrientation(activeProduct.sizeCode, activePhoto);
  const [pvW, pvH] = orientedAspect(activeProduct.sizeCode, activeOrientation);
  const activeQty = activeItem?.qty ?? 0;
  const isPhotoPrint = activeProduct.productType === "photo_print";
  const activePaper = paperByKey[activeKey] ?? "glossy";
  const activeBorder = borderByKey[activeKey] ?? false;
  // ¼" margin as a % of each side (uniform physical border).
  const insetXPct = (0.25 / pvW) * 100;
  const insetYPct = (0.25 / pvH) * 100;

  const photoIndex = photos.findIndex((p) => p.id === activePhoto.id);
  const photoPrints = catalog.filter((p) => p.productType === "photo_print");
  const wallArt = catalog.filter((p) => p.productType === "poster");
  const lineItems = Object.values(items);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-cream text-ink">
      {/* Promo / nav bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-ink/10 bg-ink px-4">
        <Link href="/" aria-label="FusionPrints home" className="cursor-pointer">
          <Logo variant="on-dark" height={28} />
        </Link>
        <nav className="flex items-center gap-5 text-xs font-medium text-cream">
          <Link href="/account/photos" className="cursor-pointer transition-colors duration-200 hover:text-malachite">
            My Photos
          </Link>
          <Link href="/account" className="cursor-pointer transition-colors duration-200 hover:text-malachite">
            My Account
          </Link>
        </nav>
      </div>

      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink/10 bg-white px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/account/photos"
            aria-label="Close editor"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-mute transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <span className="text-sm font-semibold text-ink">Create prints</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-mute">
            Subtotal <span className="ml-1 font-mono text-ink">{formatPrice(subtotal)}</span>
          </span>
          {view === "editor" ? (
            <button
              type="button"
              onClick={() => setView("summary")}
              disabled={totalPrints === 0}
              className="flex h-10 items-center rounded-full bg-malachite px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:cursor-not-allowed disabled:bg-malachite/40 disabled:text-ink/50 enabled:cursor-pointer"
            >
              Review &amp; cart{totalPrints > 0 ? ` (${totalPrints})` : ""}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setView("editor")}
              className="flex h-10 cursor-pointer items-center gap-1 rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink/5"
            >
              ‹ Back to editing
            </button>
          )}
        </div>
      </header>

      {view === "summary" ? (
        <SummaryView
          items={lineItems}
          photos={photos}
          labelOf={labelOf}
          priceOf={priceOf}
          subtotal={subtotal}
          onChangeQty={setQty}
          onEdit={editItem}
          onDelete={(photoId, sizeCode) => setQty(photoId, sizeCode, 0)}
          onCommit={commitToCart}
        />
      ) : (
        <>
          {/* Photo strip */}
          <div className="flex shrink-0 items-center gap-3 border-b border-ink/10 bg-white px-4 py-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleUpload(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
            <div className="flex shrink-0 flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 cursor-pointer items-center rounded-full bg-ink px-4 text-xs font-semibold text-cream transition-colors duration-200 hover:bg-ink/85"
              >
                {uploading > 0 ? "Uploading…" : "Upload photos"}
              </button>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelected(new Set(photos.map((p) => p.id)))}
                  className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-[11px] text-ink-soft transition-colors duration-200 hover:border-ink/30 hover:text-ink"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-[11px] text-ink-soft transition-colors duration-200 hover:border-ink/30 hover:text-ink"
                >
                  None
                </button>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">
              {photos.map((p) => {
                const isActive = p.id === activePhoto.id;
                const isSel = selected.has(p.id);
                const count = printCountOf(p.id);
                return (
                  <div key={p.id} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setActivePhotoId(p.id)}
                      className={`relative block h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors duration-200 sm:h-28 sm:w-28 ${
                        isActive ? "border-malachite" : "border-transparent hover:border-ink/20"
                      }`}
                    >
                      <Image src={p.storageUrl} alt="" fill sizes="(max-width: 640px) 64px, 112px" className="object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSelected(p.id)}
                      aria-label={isSel ? "Deselect" : "Select"}
                      className={`absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                        isSel ? "border-malachite bg-malachite text-ink" : "border-white/80 bg-ink/30 text-transparent"
                      }`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {count > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-cream">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1">
            {/* Left: size list (desktop only — mobile uses the dropdown) */}
            <aside className="hidden w-64 shrink-0 space-y-5 overflow-y-auto border-r border-ink/10 bg-white p-4 lg:block">
              <p className="text-xs text-ink-mute">
                {selected.size > 1 ? `Adding sizes to ${selected.size} photos` : "Tap a size's + to add it"}
              </p>
              <SizeGroup title="Photo prints" items={photoPrints} activeSizeCode={activeSizeCode} activePhotoId={activePhoto.id} lineItems={items} onSelect={setActiveSizeCode} onAdd={addSize} />
              <SizeGroup title="Wall art" items={wallArt} activeSizeCode={activeSizeCode} activePhotoId={activePhoto.id} lineItems={items} onSelect={setActiveSizeCode} onAdd={addSize} />
            </aside>

            {/* Centre */}
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">
              {addedNote && (
                <p className="mx-auto mb-3 rounded-full bg-malachite/15 px-4 py-2 text-sm text-ink">{addedNote}</p>
              )}

              {/* Size + qty. Mobile: a Product button opening the Select Product modal
                  (Mpix-style, our font). Desktop: label (the sidebar selects). */}
              <div className="w-full shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSizeModalOpen(true)}
                    className="flex min-w-0 flex-1 cursor-pointer flex-col items-start rounded-xl border border-ink/15 bg-white px-3 py-2 text-left transition-colors duration-200 hover:border-ink/30 lg:hidden"
                  >
                    <span className="text-[11px] text-ink-mute">Product</span>
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{activeProduct.labelInches} print</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-ink-mute">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                  <span className="hidden text-sm font-semibold text-ink lg:inline">
                    {activeProduct.labelInches} print
                  </span>
                  <QtyStepper
                    label="Quantity"
                    value={activeQty}
                    onDec={() => setQty(activePhoto.id, activeProduct.sizeCode, activeQty - 1)}
                    onInc={() => setQty(activePhoto.id, activeProduct.sizeCode, activeQty + 1)}
                  />
                </div>

                {/* Finish options — desktop shows them up top */}
                <div className="hidden lg:block">
                  <div className="my-3 border-t border-ink/10" />
                  <FinishOptions
                    isPhotoPrint={isPhotoPrint}
                    finish={activeProduct.finish}
                    activePaper={activePaper}
                    onPaper={(p) => setPaperByKey((prev) => ({ ...prev, [activeKey]: p }))}
                    activeBorder={activeBorder}
                    onBorder={(on) => setBorderByKey((prev) => ({ ...prev, [activeKey]: on }))}
                  />
                </div>
              </div>

              {/* Separator before the image */}
              <div className="mt-3 shrink-0 border-t border-ink/10" />

              {/* Clickable preview — fills remaining space; opens focus mode */}
              <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
                <button
                  type="button"
                  onClick={() => setFocused(true)}
                  aria-label="Edit or crop this photo"
                  className="group relative block h-full cursor-pointer overflow-hidden rounded-lg bg-white shadow-md"
                  style={{ aspectRatio: `${pvW} / ${pvH}`, maxWidth: "100%", maxHeight: "100%" }}
                >
                  {activeItem?.processedUrl ? (
                    <Image src={activeItem.processedUrl} alt="Edited print preview" fill sizes="560px" className="object-cover" priority />
                  ) : activeBorder ? (
                    // ¼" white border: inset the image; the white box shows as the border.
                    <span
                      className="absolute overflow-hidden"
                      style={{ top: `${insetYPct}%`, bottom: `${insetYPct}%`, left: `${insetXPct}%`, right: `${insetXPct}%` }}
                    >
                      <Image src={activePhoto.storageUrl} alt={activePhoto.originalFilename ?? "Photo to print"} fill sizes="560px" className="object-cover" priority />
                    </span>
                  ) : (
                    <>
                      <Image src={activePhoto.storageUrl} alt={activePhoto.originalFilename ?? "Photo to print"} fill sizes="560px" className="object-cover" priority />
                      {/* grey ¼" margin guide (within the image) */}
                      <span className="pointer-events-none absolute inset-x-0 top-0 bg-[#6b7280]/40" style={{ height: `${insetYPct}%` }} />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#6b7280]/40" style={{ height: `${insetYPct}%` }} />
                      <span className="pointer-events-none absolute left-0 bg-[#6b7280]/40" style={{ top: `${insetYPct}%`, bottom: `${insetYPct}%`, width: `${insetXPct}%` }} />
                      <span className="pointer-events-none absolute right-0 bg-[#6b7280]/40" style={{ top: `${insetYPct}%`, bottom: `${insetYPct}%`, width: `${insetXPct}%` }} />
                    </>
                  )}
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:bg-ink/25 group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink">Edit / Crop</span>
                  </span>
                </button>
              </div>

              {/* Edit/Crop (desktop button) / tap hint (mobile) */}
              <div className="mt-3 flex shrink-0 justify-center">
                <button
                  type="button"
                  onClick={() => setFocused(true)}
                  className="hidden h-10 cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-5 text-sm font-medium text-ink transition-colors duration-200 hover:border-ink/30 lg:flex"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 16v4h4M20 8V4h-4M4 8V4h4M20 16v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Edit / Crop
                </button>
                <p className="text-xs text-ink-mute lg:hidden">Tap the photo to crop &amp; edit</p>
              </div>

              {/* Finish options — mobile shows them at the bottom (Mpix-style) */}
              <div className="mt-3 shrink-0 lg:hidden">
                <FinishOptions
                  isPhotoPrint={isPhotoPrint}
                  finish={activeProduct.finish}
                  activePaper={activePaper}
                  onPaper={(p) => setPaperByKey((prev) => ({ ...prev, [activeKey]: p }))}
                  activeBorder={activeBorder}
                  onBorder={(on) => setBorderByKey((prev) => ({ ...prev, [activeKey]: on }))}
                />
              </div>
            </main>
          </div>
        </>
      )}

      {/* Focused crop overlay */}
      {focused && (
        <CropModal
          photo={activePhoto}
          product={activeProduct}
          initialOrientation={activeOrientation}
          border={activeBorder}
          qty={activeQty}
          onQtyChange={(q) => setQty(activePhoto.id, activeProduct.sizeCode, q)}
          photoIndex={photoIndex}
          photoCount={photos.length}
          onPrev={() => setActivePhotoId(photos[(photoIndex - 1 + photos.length) % photos.length].id)}
          onNext={() => setActivePhotoId(photos[(photoIndex + 1) % photos.length].id)}
          onCancel={() => setFocused(false)}
          onSave={saveCrop}
        />
      )}

      {/* Mobile size picker — Select Product modal (Mpix-style) */}
      {sizeModalOpen && (
        <SizePickerModal
          photoPrints={photoPrints}
          wallArt={wallArt}
          activeSizeCode={activeSizeCode}
          onSelect={(code) => {
            setActiveSizeCode(code);
            setSizeModalOpen(false);
          }}
          onClose={() => setSizeModalOpen(false)}
        />
      )}
    </div>
  );
}

function SizePickerModal({
  photoPrints,
  wallArt,
  activeSizeCode,
  onSelect,
  onClose,
}: {
  photoPrints: CatalogProduct[];
  wallArt: CatalogProduct[];
  activeSizeCode: string | null;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const groups = [
    { title: "Popular sizes", items: photoPrints },
    { title: "Wall art", items: wallArt },
  ];
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/40 lg:hidden" onClick={onClose}>
      <div
        className="mt-auto max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-cream p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-fraunces text-lg font-bold text-ink">Select product</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-mute transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {groups.map((g) =>
          g.items.length === 0 ? null : (
            <div key={g.title} className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">{g.title}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {g.items.map((p) => (
                  <button
                    key={p.sizeCode}
                    type="button"
                    onClick={() => onSelect(p.sizeCode)}
                    className={`flex min-h-[44px] cursor-pointer flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 ${
                      p.sizeCode === activeSizeCode ? "border-malachite bg-malachite/10" : "border-ink/15 hover:border-ink/30"
                    }`}
                  >
                    <span className="text-sm font-semibold text-ink">{p.labelInches}</span>
                    <span className="font-mono text-[11px] text-ink-mute">Starting at {formatPrice(p.unitPriceUsd)}</span>
                  </button>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Paper / Border / Frame options as dropdowns. Left-justified row on desktop;
 * full-width thirds on mobile. Paper = Glossy/Satin (photo prints); Border =
 * None / ¼" white border; Frame = coming soon.
 */
function FinishOptions({
  isPhotoPrint,
  finish,
  activePaper,
  onPaper,
  activeBorder,
  onBorder,
}: {
  isPhotoPrint: boolean;
  finish: string;
  activePaper: "glossy" | "satin";
  onPaper: (p: "glossy" | "satin") => void;
  activeBorder: boolean;
  onBorder: (on: boolean) => void;
}) {
  const item = "min-w-0 flex-1 lg:flex-none lg:w-48";
  return (
    <div className="flex gap-2">
      {isPhotoPrint ? (
        <Dropdown
          label="Paper"
          value={activePaper}
          onChange={(v) => onPaper(v as "glossy" | "satin")}
          options={[
            { value: "glossy", label: "Glossy" },
            { value: "satin", label: "Satin" },
          ]}
          className={item}
        />
      ) : (
        <div className={`${item} flex flex-col rounded-xl border border-ink/15 px-3 py-2`}>
          <span className="text-[11px] text-ink-mute">Paper</span>
          <span className="text-sm font-medium text-ink">{cap(finish)}</span>
        </div>
      )}

      <Dropdown
        label="Finishing & Border"
        value={activeBorder ? "quarter" : "none"}
        onChange={(v) => onBorder(v === "quarter")}
        options={[
          { value: "none", label: "None" },
          { value: "quarter", label: '¼" white border', hint: 'Include a ¼" white border around your image' },
        ]}
        className={item}
      />

      <div className={`${item} flex flex-col rounded-xl border border-dashed border-ink/15 px-3 py-2`}>
        <span className="flex items-center gap-1 text-[11px] text-ink-mute">
          Frame / Mount <span className="rounded bg-ink/8 px-1 text-[10px]">soon</span>
        </span>
        <span className="text-sm font-medium text-ink-mute">None</span>
      </div>
    </div>
  );
}

function QtyStepper({
  value,
  onDec,
  onInc,
  label,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm font-medium text-ink-soft">{label}</span>}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onDec}
          aria-label="Decrease quantity"
          disabled={value <= 0}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-ink/5 text-lg font-bold text-ink-soft transition-colors duration-200 hover:bg-ink/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-sm">{value}</span>
        <button
          type="button"
          onClick={onInc}
          aria-label="Increase quantity"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-malachite text-lg font-bold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SizeGroup({
  title,
  items,
  activeSizeCode,
  activePhotoId,
  lineItems,
  onSelect,
  onAdd,
}: {
  title: string;
  items: CatalogProduct[];
  activeSizeCode: string | null;
  activePhotoId: string;
  lineItems: Record<string, LineItem>;
  onSelect: (code: string) => void;
  onAdd: (code: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">{title}</p>
      <div className="mt-2 space-y-1.5">
        {items.map((p) => {
          const active = p.sizeCode === activeSizeCode;
          const added = Boolean(lineItems[keyOf(activePhotoId, p.sizeCode)]);
          return (
            <div key={p.sizeCode} className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors duration-200 ${active ? "border-malachite bg-malachite/10" : "border-ink/15"}`}>
              <button type="button" onClick={() => onSelect(p.sizeCode)} className="flex min-h-[40px] flex-1 cursor-pointer flex-col items-start text-left">
                <span className="text-sm font-semibold text-ink">{p.labelInches}</span>
                <span className="font-mono text-[11px] text-ink-mute">Starting at {formatPrice(p.unitPriceUsd)}</span>
              </button>
              <button type="button" onClick={() => onAdd(p.sizeCode)} aria-label={`Add ${p.labelInches}`} className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-lg font-semibold transition-colors duration-200 ${added ? "bg-malachite text-ink" : "bg-ink/5 text-ink hover:bg-malachite hover:text-ink"}`}>
                {added ? "✓" : "+"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryView({
  items,
  photos,
  labelOf,
  priceOf,
  subtotal,
  onChangeQty,
  onEdit,
  onDelete,
  onCommit,
}: {
  items: LineItem[];
  photos: Photo[];
  labelOf: (s: string) => string;
  priceOf: (s: string) => number;
  subtotal: number;
  onChangeQty: (photoId: string, sizeCode: string, qty: number) => void;
  onEdit: (photoId: string, sizeCode: string) => void;
  onDelete: (photoId: string, sizeCode: string) => void;
  onCommit: () => void;
}) {
  const totalPrints = items.reduce((n, it) => n + it.qty, 0);
  return (
    <div className="mx-auto w-full min-h-0 max-w-5xl flex-1 overflow-auto p-4 sm:p-8">
      <h1 className="font-fraunces text-2xl font-bold text-ink">Review your prints</h1>
      <p className="mt-1 text-sm text-ink-mute">Check sizes and quantities, then add everything to your cart.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Left: line items + upsell */}
        <div className="space-y-4">
          <div className="divide-y divide-ink/8 rounded-2xl border border-ink/10 bg-white">
            {items.length === 0 && <p className="p-6 text-center text-sm text-ink-mute">No prints selected yet.</p>}
            {items.map((it) => {
              const photo = photos.find((p) => p.id === it.photoId);
              const line = it.qty * priceOf(it.sizeCode);
              return (
                <div key={keyOf(it.photoId, it.sizeCode)} className="flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                    {photo && <Image src={photo.storageUrl} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{labelOf(it.sizeCode)} print</p>
                    <p className="font-mono text-xs text-ink-mute">{formatPrice(priceOf(it.sizeCode))} each</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-ink">{formatPrice(line)}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <QtyStepper value={it.qty} onDec={() => onChangeQty(it.photoId, it.sizeCode, it.qty - 1)} onInc={() => onChangeQty(it.photoId, it.sizeCode, it.qty + 1)} />
                    <div className="flex gap-2 text-xs font-medium">
                      <button type="button" onClick={() => onEdit(it.photoId, it.sizeCode)} className="cursor-pointer rounded-full border border-ink/15 px-3 py-1 text-ink-soft transition-colors duration-200 hover:border-ink/30 hover:text-ink">
                        Edit
                      </button>
                      <button type="button" onClick={() => onDelete(it.photoId, it.sizeCode)} className="cursor-pointer rounded-full border border-coral/40 px-3 py-1 text-coral transition-colors duration-200 hover:bg-coral/10">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upsell placeholder (post-launch) */}
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              Add a frame or mount <span className="rounded bg-ink/8 px-1.5 text-[10px] font-medium text-ink-mute">coming soon</span>
            </p>
            <p className="mt-1 text-sm text-ink-mute">Finish your prints with a frame, mount, or gift box — coming after launch.</p>
          </div>
        </div>

        {/* Right: order summary */}
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-5 lg:sticky lg:top-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">Order summary</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink-soft">{totalPrints} print{totalPrints === 1 ? "" : "s"}</span>
            <span className="font-mono text-ink">{formatPrice(subtotal)}</span>
          </div>
          <div className="my-4 border-t border-ink/10" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Subtotal</span>
            <span className="font-mono text-2xl font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={onCommit}
            disabled={items.length === 0}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:cursor-not-allowed disabled:bg-malachite/40 disabled:text-ink/50 enabled:cursor-pointer"
          >
            Add to cart
          </button>
        </aside>
      </div>
    </div>
  );
}
