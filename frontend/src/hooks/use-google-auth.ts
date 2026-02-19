'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '647538125474-eksdvflmqlv6u8cmcvr09hlmb9kl2f77.apps.googleusercontent.com';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            }
          ) => void;
        };
      };
    };
  }
}

// Module-level script load promise (survives component remounts)
let gisPromise: Promise<void> | null = null;

function ensureGISLoaded(): Promise<void> {
  if (gisPromise) return gisPromise;
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    return Promise.resolve();
  }
  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisPromise = null;
      reject(new Error('Failed to load Google Sign-In'));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

/**
 * Loads Google Identity Services, initializes it, and provides a ref callback
 * to render the official Google Sign-In button into a container element.
 *
 * Usage:
 *   const { googleButtonRef, error } = useGoogleAuth();
 *   <div ref={googleButtonRef} className="w-full flex justify-center" />
 */
export function useGoogleAuth() {
  const router = useRouter();
  const { googleLogin } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Ref-based callback so GIS always invokes the latest closure
  const credentialHandlerRef = useRef<(response: { credential: string }) => void>();
  credentialHandlerRef.current = async (response) => {
    setError(null);
    try {
      await googleLogin(response.credential);
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'consultant') {
        router.push('/consultant');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Google sign-in failed. Please try again.');
    }
  };

  // Load GIS script and initialize once
  useEffect(() => {
    let cancelled = false;
    ensureGISLoaded()
      .then(() => {
        if (cancelled) return;
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential: string }) => {
            credentialHandlerRef.current?.(response);
          },
          cancel_on_tap_outside: true,
        });
        setScriptReady(true);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load Google Sign-In. Please refresh the page.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Render the official Google button into the container element
  const renderButton = useCallback((el: HTMLDivElement | null) => {
    if (!el || !window.google?.accounts?.id) return;
    el.innerHTML = '';
    window.google.accounts.id.renderButton(el, {
      theme: 'filled_black',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: Math.min(el.offsetWidth || 400, 400),
    });
  }, []);

  // Ref callback: store container and render when possible
  const googleButtonRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      if (el && scriptReady) {
        renderButton(el);
      }
    },
    [scriptReady, renderButton]
  );

  // Re-render button when script becomes ready after container was already mounted
  useEffect(() => {
    if (scriptReady && containerRef.current) {
      renderButton(containerRef.current);
    }
  }, [scriptReady, renderButton]);

  return { googleButtonRef, error, ready: scriptReady };
}
