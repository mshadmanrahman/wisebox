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
      <body className="min-h-screen bg-wisebox-background-darker flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-wisebox-background-card rounded-2xl border border-wisebox-border p-8 text-center">
          <h2 className="text-xl font-semibold text-wisebox-text-primary mb-2">Something went wrong</h2>
          <p className="text-wisebox-text-secondary text-sm mb-4">{error.message}</p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-wisebox-status-success hover:bg-wisebox-status-success/90 text-wisebox-text-primary font-medium py-2 px-6 text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
