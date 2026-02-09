import { Providers } from '@/components/providers';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation bar placeholder - will be built in Phase 2 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl font-bold text-teal-700">Wisebox</h1>
            <nav className="flex items-center gap-6 text-sm text-gray-600">
              <span>Dashboard</span>
              <span>Properties</span>
              <span>Services</span>
              <span>Tickets</span>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </Providers>
  );
}
