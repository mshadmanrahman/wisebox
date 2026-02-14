'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, KeyRound, Loader2, Mail } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-wisebox-background">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rounded"></div>
            </div>
            <span className="text-xl font-semibold text-white">Wisebox</span>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-wisebox-primary/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-wisebox-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
                <p className="text-wisebox-text-secondary">
                  We sent a password reset link to your email address. Click the link to reset your password.
                </p>
              </div>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-wisebox-border text-white hover:bg-wisebox-background-lighter h-12"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Reset password</h1>
                <p className="text-wisebox-text-secondary">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted h-12"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white hover:bg-gray-100 text-wisebox-background h-12 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-wisebox-text-secondary">
                <Link href="/login" className="text-white font-medium hover:underline inline-flex items-center">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to sign in
                </Link>
              </p>
            </>
          )}

          {/* Footer */}
          <div className="pt-8 border-t border-wisebox-border">
            <p className="text-xs text-wisebox-text-muted text-center">
              © 2025 WiseBox. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 p-12 items-center justify-center">
        <div className="max-w-md text-white space-y-8">
          <KeyRound className="w-16 h-16 text-white/80" />
          <h2 className="text-3xl font-bold">Secure Access</h2>
          <p className="text-teal-100 text-lg">
            Your property data is protected with secure authentication. Reset your password to regain access to your workspace.
          </p>
          <div className="space-y-4 text-teal-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p>Enter your registered email address</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p>Check your inbox for the reset link</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p>Create a new password and sign back in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
