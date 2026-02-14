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
  return <>{children}</>;
}
