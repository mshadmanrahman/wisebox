'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card rounded-xl border border-border p-8 text-center shadow-sm dark:shadow-none">
          <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground text-sm mb-4">{error.message}</p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-6 text-sm transition-all duration-200"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
