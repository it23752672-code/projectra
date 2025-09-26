// Runtime-safe toast shim that prefers react-hot-toast when available
// Falls back to console-based no-op implementations if the package is not installed.

/* eslint-disable @typescript-eslint/no-explicit-any */

// Use a variable specifier with @vite-ignore to avoid Vite static resolution errors
const modName = 'react-hot-toast';
let realToast: any;
let RealToaster: any;

try {
  // @ts-ignore - dynamic import with variable
  const mod: any = await import(/* @vite-ignore */ (modName as string));
  realToast = mod?.toast;
  RealToaster = mod?.Toaster;
} catch (_err) {
  // Package not installed or failed to load; we'll provide fallbacks
}

// Minimal fallback toast API compatible with our usage patterns
const fallbackToast = Object.assign(
  (msg: any) => console.log('[toast]', msg),
  {
    success: (msg: any) => console.log('[toast:success]', msg),
    error: (msg: any) => console.error('[toast:error]', msg),
    loading: (msg: any) => console.log('[toast:loading]', msg),
    dismiss: (_id?: any) => { /* no-op */ },
    remove: (_id?: any) => { /* no-op */ },
    custom: (renderer: any) => {
      try { console.log('[toast:custom]', renderer); } catch {}
      return undefined;
    },
  }
);

// Fallback Toaster does nothing (no UI)
const FallbackToaster = () => null;

export const toast: any = realToast ?? fallbackToast;
export const Toaster: any = RealToaster ?? FallbackToaster;
