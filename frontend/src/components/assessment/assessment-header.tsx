'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { WiseboxLogo } from '@/components/ui/wisebox-logo';
import { useAuthStore } from '@/stores/auth';

interface AssessmentHeaderProps {
  progress?: number;
}

export function AssessmentHeader({ progress = 0 }: AssessmentHeaderProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
      return unsub;
    }
  }, []);

  const user = useAuthStore((s) => s.user);
  const isLoggedIn = hydrated && !!user;
  const exitHref = isLoggedIn ? '/dashboard' : '/';

  return (
    <>
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl border-b border-border">
        {/* Left */}
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
        ) : (
          <Link href="/">
            <WiseboxLogo variant="auto" size="sm" />
          </Link>
        )}

        {/* Center */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span>Free Assessment</span>
          {!isLoggedIn && (
            <>
              <span>&middot;</span>
              <span>No sign-up required</span>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {!isLoggedIn && (
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              Sign In
            </Link>
          )}
          <Link
            href={exitHref}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            title="Exit assessment"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </header>

      {/* Thin full-width progress bar below header */}
      <div className="h-0.5 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
}
