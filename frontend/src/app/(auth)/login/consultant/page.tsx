'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import type { AuthResponse } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ConsultantLoginPage() {
  const { t } = useTranslation('consultant');
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
        portal: 'consultant',
      });
      const { user, token } = response.data.data;
      localStorage.setItem('wisebox_token', token);
      document.cookie = `wisebox_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      useAuthStore.setState({ user, token, isAuthenticated: true });
      router.push('/consultant');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = error.response?.data?.errors?.email?.[0]
        || error.response?.data?.message
        || t('login.invalidCredentials');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-icon-accent rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">{t('login.brand')}</span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('login.title')}</h1>
            <p className="text-muted-foreground">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                {t('login.emailLabel')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm font-medium">
                {t('login.passwordLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete="current-password"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-wisebox-accent-emerald hover:bg-wisebox-accent-emerald/90 text-foreground h-12 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.submitting')}
                </>
              ) : (
                t('login.submit')
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('login.notConsultant')}{' '}
              <Link href="/login" className="text-wisebox-accent-emerald font-medium hover:underline">
                {t('login.userLogin')}
              </Link>
              {' | '}
              <Link href="/login/admin" className="text-wisebox-accent-emerald font-medium hover:underline">
                {t('login.adminLogin')}
              </Link>
            </p>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {t('login.footer')}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Consultant Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-auth-consultant p-12 items-center justify-center">
        <div className="max-w-md text-foreground space-y-8">
          <Briefcase className="w-16 h-16 text-foreground/80" />
          <h2 className="text-3xl font-bold">{t('login.sideTitle')}</h2>
          <div className="space-y-4 text-foreground/90">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-foreground text-xs font-bold">1</span>
              </div>
              <p>{t('login.sideStep1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-foreground text-xs font-bold">2</span>
              </div>
              <p>{t('login.sideStep2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-foreground text-xs font-bold">3</span>
              </div>
              <p>{t('login.sideStep3')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
