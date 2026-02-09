import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wisebox - Authentication',
  description: 'Sign in to manage your properties',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-4">Wisebox</h1>
          <p className="text-xl text-teal-100 mb-8">
            Manage your ancestral properties from anywhere in the world.
          </p>
          <div className="space-y-4 text-teal-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">1</span>
              </div>
              <p>Register your properties and upload documents</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">2</span>
              </div>
              <p>Get a free assessment of your property documentation</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">3</span>
              </div>
              <p>Connect with legal experts for verification and services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
