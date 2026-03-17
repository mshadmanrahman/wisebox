'use client';

import { useEffect } from 'react';
import { initAnalytics, identifyUser, resetAnalytics } from '@/lib/analytics';
import { useAuthStore } from '@/stores/auth';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Initialize Amplitude once on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Identify or reset when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      identifyUser({
        id: user.id,
        role: user.role,
        created_at: user.created_at,
      });
    } else {
      resetAnalytics();
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
