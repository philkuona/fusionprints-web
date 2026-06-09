/**
 * Payonify embedded SDK loader + types.
 *
 * The UMD script exposes `window.Payonify`. We construct it with the publishable
 * key, set onSuccess/onError/onClose, then mount the Drop-In into a container we
 * render inside our own modal (the SDK provides the form; we provide the chrome).
 * See https://docs.payonify.com/checkouts/embedded/drop-in.
 */

export interface PayonifyInstance {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
  mount: (opts: { container: HTMLElement; clientSecret: string }) => void;
}

export interface PayonifyConstructor {
  new (opts: { publishableKey: string }): PayonifyInstance;
}

declare global {
  interface Window {
    Payonify?: PayonifyConstructor;
  }
}

const SDK_URL = "https://js.payonify.com/v1/payonify.umd.js";

export const PAYONIFY_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PAYONIFY_PUBLISHABLE_KEY ?? "";

let loadPromise: Promise<PayonifyConstructor> | null = null;

/** Inject the Payonify SDK once and resolve with its constructor. */
export function loadPayonifySdk(): Promise<PayonifyConstructor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Payonify SDK can only load in the browser"));
  }
  if (window.Payonify) return Promise.resolve(window.Payonify);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<PayonifyConstructor>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () =>
      window.Payonify
        ? resolve(window.Payonify)
        : reject(new Error("Payonify SDK loaded but window.Payonify is missing"));
    script.onerror = () => {
      loadPromise = null; // allow a retry
      reject(new Error("Failed to load the Payonify SDK"));
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}
