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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { AuthTestimonialCarousel } from '@/components/auth/testimonial-carousel';
import { WiseboxLogo } from '@/components/ui/wisebox-logo';

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
  const { t } = useTranslation(['auth', 'common']);

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
      setError(error.response?.data?.message || t('auth:login.invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen flex bg-wisebox-background">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <WiseboxLogo variant="light" />

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-wisebox-text-primary mb-2">{t('auth:login.title')}</h1>
            <p className="text-wisebox-text-secondary">
              {t('auth:login.subtitle')}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 text-sm text-wisebox-status-danger bg-wisebox-status-danger/10 border border-wisebox-status-danger/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-wisebox-text-primary text-sm font-medium">
                {t('auth:login.emailLabel')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth:login.emailPlaceholder')}
                autoComplete="email"
                className="bg-wisebox-background-input border-wisebox-border text-wisebox-text-primary placeholder:text-wisebox-text-muted h-12"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-wisebox-status-danger">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-wisebox-text-primary text-sm font-medium">
                  {t('auth:login.passwordLabel')}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-wisebox-primary hover:underline"
                >
                  {t('auth:login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth:login.passwordPlaceholder')}
                  autoComplete="current-password"
                  className="bg-wisebox-background-input border-wisebox-border text-wisebox-text-primary placeholder:text-wisebox-text-muted h-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wisebox-text-muted hover:text-wisebox-text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-wisebox-status-danger">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-white hover:bg-white/90 text-wisebox-background h-12 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth:login.submitting')}
                </>
              ) : (
                t('auth:login.submit')
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-wisebox-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-wisebox-background px-2 text-wisebox-text-muted">{t('auth:login.orContinueWith')}</span>
              </div>
            </div>

            <div ref={googleButtonRef} className="w-full flex justify-center" />
            {googleError && (
              <p className="text-sm text-wisebox-status-danger text-center">{googleError}</p>
            )}

            <p className="text-center text-sm text-wisebox-text-secondary">
              {t('auth:login.noAccount')}{' '}
              <Link href="/register" className="text-wisebox-text-primary font-medium hover:underline">
                {t('auth:login.createAccount')}
              </Link>
            </p>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-wisebox-border">
            <p className="text-xs text-wisebox-text-muted text-center">
              {t('common:copyright')}
            </p>
            <div className="flex justify-center gap-6 mt-2">
              <Link href="/privacy" className="text-xs text-wisebox-text-muted hover:text-wisebox-text-primary">
                {t('common:privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-xs text-wisebox-text-muted hover:text-wisebox-text-primary">
                {t('common:termsOfService')}
              </Link>
              <Link href="/help" className="text-xs text-wisebox-text-muted hover:text-wisebox-text-primary">
                {t('common:helpCenter')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Rotating Testimonials */}
      <AuthTestimonialCarousel />
    </div>
  );
}
