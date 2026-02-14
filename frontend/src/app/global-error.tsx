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
      <body className="min-h-screen bg-[#0f1219] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#151a27] rounded-2xl border border-gray-800 p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-4">{error.message}</p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
