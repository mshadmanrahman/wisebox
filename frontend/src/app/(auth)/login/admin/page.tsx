'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import api from '@/lib/api';
import type { AuthResponse } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        ...data,
        portal: 'admin',
      });
      const { user, token } = response.data.data;
      localStorage.setItem('wisebox_token', token);
      document.cookie = `wisebox_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      useAuthStore.setState({ user, token, isAuthenticated: true });
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = error.response?.data?.errors?.email?.[0]
        || error.response?.data?.message
        || 'Invalid credentials or insufficient permissions.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">Wisebox Admin</span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-slate-400">
              Sign in to manage consultations, users, and platform operations
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
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@wisebox.co"
                autoComplete="email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
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
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to Admin'
              )}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Not an admin?{' '}
              <Link href="/login" className="text-amber-400 font-medium hover:underline">
                User login
              </Link>
              {' | '}
              <Link href="/login/consultant" className="text-amber-400 font-medium hover:underline">
                Consultant login
              </Link>
            </p>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-800">
            <p className="text-xs text-slate-600 text-center">
              Wisebox Admin Portal. Authorized access only.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Admin Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-600 to-orange-700 p-12 items-center justify-center">
        <div className="max-w-md text-white space-y-8">
          <Shield className="w-16 h-16 text-white/80" />
          <h2 className="text-3xl font-bold">Administration Center</h2>
          <div className="space-y-4 text-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p>Review and approve free consultation requests</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p>Assign consultants to customer properties</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p>Monitor platform health and user activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
