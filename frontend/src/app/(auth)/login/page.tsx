'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, MapPin } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/use-google-auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { googleButtonRef, error: googleError } = useGoogleAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
      // Redirect based on role
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'consultant') {
        router.push('/consultant');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
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

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-wisebox-text-secondary">
              Sign in to your account to manage your properties
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
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-wisebox-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted h-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wisebox-text-muted hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
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
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-wisebox-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-wisebox-background px-2 text-wisebox-text-muted">Or continue with</span>
              </div>
            </div>

            <div ref={googleButtonRef} className="w-full flex justify-center" />
            {googleError && (
              <p className="text-sm text-red-400 text-center">{googleError}</p>
            )}

            <p className="text-center text-sm text-wisebox-text-secondary">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-white font-medium hover:underline">
                Create account
              </Link>
            </p>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-wisebox-border">
            <p className="text-xs text-wisebox-text-muted text-center">
              © 2025 WiseBox. All rights reserved.
            </p>
            <div className="flex justify-center gap-6 mt-2">
              <Link href="/privacy" className="text-xs text-wisebox-text-muted hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-wisebox-text-muted hover:text-white">
                Terms of Service
              </Link>
              <Link href="/help" className="text-xs text-wisebox-text-muted hover:text-white">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-wisebox-background-card relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/auth/login-testimonial.jpg"
            alt="Happy customer"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/40"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          {/* Location badge */}
          <div className="absolute top-8 right-8 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
            <MapPin className="w-4 h-4" />
            <span>Toronto, Canada</span>
          </div>

          {/* Testimonial */}
          <div className="max-w-xl space-y-4 bg-gradient-to-t from-black/60 to-transparent p-8 rounded-2xl backdrop-blur-sm">
            <svg className="w-10 h-10 text-white/80" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="text-lg leading-relaxed">
              WiseBox has been a lifesaver for managing my family&apos;s properties back in Bangladesh. Everything is now organized and accessible from Toronto. I can finally sleep peacefully knowing our assets are properly documented and protected.
            </p>
            <div>
              <p className="font-semibold">Ahmed Hassan</p>
              <p className="text-sm text-white/80">Software Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
