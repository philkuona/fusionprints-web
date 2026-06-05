"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getPhotos,
  deletePhoto,
  uploadPhoto,
  type Photo,
} from "@/lib/api/photos";
import { getCatalog } from "@/lib/api/catalog";

const ACCEPT = "image/jpeg,image/png,image/tiff,image/webp,image/heic,image/heif";

/** A file currently being uploaded, with live progress / error state. */
interface PendingUpload {
  key: string;
  name: string;
  progress: number;
  error?: string;
}

let uploadKeySeq = 0;

export default function PhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // Smallest "recommended" pixel count across the catalog. A photo below this
  // is too small for even our smallest print at recommended quality.
  const [lowResThreshold, setLowResThreshold] = useState<number | null>(null);

  // Size carried over from a product page ("Start printing"), so the editor opens
  // pre-set to that print size once a photo is chosen.
  const [printSize, setPrintSize] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    const readSize = () => setPrintSize(new URLSearchParams(window.location.search).get("size"));
    readSize();
  }, []);

  useEffect(() => {
    getPhotos()
      .then(setPhotos)
      .catch(() => {})
      .finally(() => setLoading(false));

    getCatalog()
      .then((list) => {
        if (list.length === 0) return;
        const min = Math.min(
          ...list.map(
            (p) => p.recommendedResolution.width * p.recommendedResolution.height,
          ),
        );
        setLowResThreshold(min);
      })
      .catch(() => {});
  }, []);

  const startUploads = useCallback((files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/") || ACCEPT.includes(f.type));
    if (images.length === 0) return;

    for (const file of images) {
      const key = `u${uploadKeySeq++}`;
      setUploads((prev) => [...prev, { key, name: file.name, progress: 0 }]);

      uploadPhoto(file, {
        onProgress: (percent) =>
          setUploads((prev) =>
            prev.map((u) => (u.key === key ? { ...u, progress: percent } : u)),
          ),
      })
        .then((created) => {
          // Prepend the new photo; drop the finished upload row.
          setPhotos((prev) => [
            {
              id: created.id,
              storageUrl: created.storageUrl,
              originalFilename: file.name,
              widthPx: created.widthPx,
              heightPx: created.heightPx,
              fileSizeBytes: created.fileSizeBytes,
              format: created.format,
              uploadedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
          setUploads((prev) => prev.filter((u) => u.key !== key));
        })
        .catch((err: unknown) => {
          const message =
            (err as { message?: string })?.message ?? "Upload failed. Please try again.";
          setUploads((prev) =>
            prev.map((u) => (u.key === key ? { ...u, error: message } : u)),
          );
        });
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragActive(false);
      startUploads(Array.from(e.dataTransfer.files));
    },
    [startUploads],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) startUploads(Array.from(e.target.files));
      e.target.value = ""; // allow re-selecting the same file
    },
    [startUploads],
  );

  const toggleSelected = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteOne = useCallback(async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    await deletePhoto(id).catch(() => {});
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} photo${ids.length === 1 ? "" : "s"}?`)) return;
    setBulkDeleting(true);
    setPhotos((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
    await Promise.all(ids.map((id) => deletePhoto(id).catch(() => {})));
    setBulkDeleting(false);
  }, [selected]);

  const isLowRes = useCallback(
    (photo: Photo): boolean => {
      if (!lowResThreshold || !photo.widthPx || !photo.heightPx) return false;
      return photo.widthPx * photo.heightPx < lowResThreshold;
    },
    [lowResThreshold],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
      </div>
    );
  }

  const hasContent = photos.length > 0 || uploads.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-2xl font-bold text-ink">My Photos</h1>
          <p className="mt-1 text-sm text-ink-mute">
            Your photos are kept safe for 90 days, ready to print whenever you are.
          </p>
        </div>
        {hasContent && (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex h-10 shrink-0 cursor-pointer items-center rounded-full bg-malachite px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
          >
            Add photos
          </button>
        )}
      </div>

      {printSize && (
        <p className="mt-5 rounded-xl bg-malachite/15 px-4 py-3 text-sm font-medium text-ink">
          Printing at {printSize.replace("x", "×")}. Choose a photo below, or add a new one, then tap
          {" "}<span className="font-semibold">Make prints</span> to start.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Drop zone — full panel when empty, slim bar when the library has photos */}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepth.current += 1;
          setDragActive(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) setDragActive(false);
        }}
        onDrop={handleDrop}
        onClick={() => !hasContent && inputRef.current?.click()}
        className={`mt-6 rounded-2xl border-2 border-dashed text-center transition-colors duration-200 ${
          dragActive
            ? "border-malachite bg-malachite/5"
            : "border-ink/15 hover:border-ink/25"
        } ${hasContent ? "py-6" : "cursor-pointer py-16"}`}
      >
        <div className="pointer-events-none flex flex-col items-center px-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={dragActive ? "text-malachite" : "text-ink-mute"}
          >
            <path
              d="M12 16V4m0 0L7 9m5-5l5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {hasContent ? (
            <p className="mt-2 text-sm text-ink-soft">
              Drag photos here to add more
            </p>
          ) : (
            <>
              <p className="mt-3 font-medium text-ink">Drag your photos here</p>
              <p className="mt-1 text-sm text-ink-mute">
                or click to browse. JPEG, PNG, TIFF, WebP
              </p>
            </>
          )}
        </div>
      </div>

      {/* In-progress uploads */}
      {uploads.length > 0 && (
        <ul className="mt-4 space-y-2">
          {uploads.map((u) => (
            <li
              key={u.key}
              className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{u.name}</p>
                {u.error ? (
                  <p className="mt-0.5 text-xs text-coral">{u.error}</p>
                ) : (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/8">
                    <div
                      className="h-full rounded-full bg-malachite transition-[width] duration-200"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {u.error ? (
                <button
                  onClick={() =>
                    setUploads((prev) => prev.filter((p) => p.key !== u.key))
                  }
                  className="shrink-0 cursor-pointer text-xs font-medium text-ink-mute transition-colors duration-200 hover:text-ink"
                >
                  Dismiss
                </button>
              ) : (
                <span className="shrink-0 font-mono text-xs text-ink-mute">
                  {u.progress}%
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Selection action bar */}
      {selected.size > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-2.5">
          <p className="text-sm font-medium text-ink">{selected.size} selected</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelected(new Set())}
              className="cursor-pointer text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="cursor-pointer text-sm font-medium text-coral transition-colors duration-200 hover:underline disabled:opacity-50"
            >
              {bulkDeleting ? "Deleting…" : "Delete selected"}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {photos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => {
            const isSelected = selected.has(photo.id);
            return (
              <div
                key={photo.id}
                className={`group relative aspect-square overflow-hidden rounded-xl border bg-ink/5 transition-colors duration-200 ${
                  isSelected ? "border-malachite ring-2 ring-malachite" : "border-ink/10"
                }`}
              >
                <Image
                  src={photo.storageUrl}
                  alt={photo.originalFilename ?? "Uploaded photo"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />

                {/* Click-to-select overlay */}
                <button
                  type="button"
                  onClick={() => toggleSelected(photo.id)}
                  aria-pressed={isSelected}
                  aria-label={isSelected ? "Deselect photo" : "Select photo"}
                  className="absolute inset-0 cursor-pointer"
                />

                {/* Selection checkmark */}
                <span
                  className={`pointer-events-none absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                    isSelected
                      ? "border-malachite bg-malachite text-ink"
                      : "border-white/80 bg-ink/20 text-transparent group-hover:bg-ink/30"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                {/* Low-res badge */}
                {isLowRes(photo) && (
                  <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-amber px-2 py-0.5 text-[11px] font-semibold text-ink">
                    Low-res
                  </span>
                )}

                {/* Hover footer: make prints + delete */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/70 to-transparent p-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => router.push(`/editor/${photo.id}${printSize ? `?size=${encodeURIComponent(printSize)}` : ""}`)}
                    className="pointer-events-auto flex h-8 cursor-pointer items-center rounded-full bg-malachite px-3 text-[11px] font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
                  >
                    Make prints
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOne(photo.id)}
                    aria-label="Delete photo"
                    className="pointer-events-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-coral transition-colors duration-200 hover:bg-white"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a1 1 0 01-1 1H7a1 1 0 01-1-1V7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
