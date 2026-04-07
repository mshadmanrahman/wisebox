'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

// Module-level script load tracking (survives component remounts)
let gisPromise: Promise<void> | null = null;
let gisLoadedLocale: string | null = null;

function ensureGISLoaded(locale: string): Promise<void> {
  // If already loaded with the same locale, reuse
  if (gisPromise && gisLoadedLocale === locale) return gisPromise;
  if (
    typeof window !== 'undefined' &&
    window.google?.accounts?.id &&
    gisLoadedLocale === locale
  ) {
    return Promise.resolve();
  }
  // Reset if locale changed (rare — only on language switch)
  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${GIS_SRC}?hl=${locale}`;
    script.async = true;
    script.onload = () => {
      gisLoadedLocale = locale;
      resolve();
    };
    script.onerror = () => {
      gisPromise = null;
      gisLoadedLocale = null;
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
  const { i18n } = useTranslation();
  const { googleLogin } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const locale = i18n.language || 'en';

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
    ensureGISLoaded(locale)
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
  }, [locale]);

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
      locale,
    });
  }, [locale]);

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
