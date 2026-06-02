/**
 * Photo library API client — /web/api/photos.
 *
 * Photos are stored in Backblaze B2 (90-day retention) and owned by the
 * signed-in web user. Uploads go one file per request so the UI can show
 * per-file progress; we use XHR (not fetch) because fetch has no upload
 * progress event.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface Photo {
  id: string;
  storageUrl: string;
  originalFilename: string | null;
  widthPx: number | null;
  heightPx: number | null;
  fileSizeBytes: number | null;
  format: string | null;
  uploadedAt: string;
}

/** Shape returned by POST /web/api/photos. */
export interface UploadedPhoto {
  id: string;
  storageUrl: string;
  widthPx: number;
  heightPx: number;
  fileSizeBytes: number;
  format: string;
}

export async function getPhotos(): Promise<Photo[]> {
  const res = await fetch(`${API}/web/api/photos`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as Photo[];
}

export async function deletePhoto(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API}/web/api/photos/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as { success: boolean };
}

export interface UploadHandlers {
  /** 0–100, fired as bytes are sent. */
  onProgress?: (percent: number) => void;
  /** Lets a caller abort an in-flight upload. */
  signal?: AbortSignal;
}

/**
 * Upload one file with progress. Resolves with the created photo, rejects
 * with the server error payload (or an Error) on failure.
 */
export function uploadPhoto(file: File, handlers: UploadHandlers = {}): Promise<UploadedPhoto> {
  const { onProgress, signal } = handlers;

  return new Promise<UploadedPhoto>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API}/web/api/photos`);
    xhr.withCredentials = true;

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON response
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as UploadedPhoto);
      } else {
        reject(body ?? { error: 'upload_failed', message: 'Upload failed.' });
      }
    });

    xhr.addEventListener('error', () =>
      reject({ error: 'network_error', message: 'Network error during upload.' }),
    );
    xhr.addEventListener('abort', () => reject({ error: 'aborted' }));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}

/** Human-readable file size, e.g. "3.2 MB". */
export function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
