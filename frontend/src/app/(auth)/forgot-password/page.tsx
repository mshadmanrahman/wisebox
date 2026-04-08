'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, KeyRound, Loader2, Mail } from 'lucide-react';
import { trackPasswordResetRequested } from '@/lib/analytics';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(['auth', 'common']);

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
      trackPasswordResetRequested();
      setSent(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t('auth:forgotPassword.failedToSend'));
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
            <div className="w-8 h-8 bg-gradient-icon-primary rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rounded"></div>
            </div>
            <span className="text-xl font-semibold text-foreground">Wisebox</span>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth:forgotPassword.checkEmail')}</h1>
                <p className="text-muted-foreground">
                  {t('auth:forgotPassword.checkEmailDescription')}
                </p>
              </div>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted h-12"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('auth:forgotPassword.backToSignIn')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth:forgotPassword.title')}</h1>
                <p className="text-muted-foreground">
                  {t('auth:forgotPassword.subtitle')}
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
                    {t('auth:forgotPassword.emailLabel')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth:forgotPassword.emailPlaceholder')}
                    autoComplete="email"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth:forgotPassword.submitting')}
                    </>
                  ) : (
                    t('auth:forgotPassword.submit')
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-foreground font-medium hover:underline inline-flex items-center">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  {t('auth:forgotPassword.backToSignIn')}
                </Link>
              </p>
            </>
          )}

          {/* Footer */}
          <div className="pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {t('common:copyright')}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-auth-primary p-12 items-center justify-center">
        <div className="max-w-md text-foreground space-y-8">
          <KeyRound className="w-16 h-16 text-foreground/80" />
          <h2 className="text-3xl font-bold">{t('auth:forgotPassword.secureAccess')}</h2>
          <p className="text-foreground/90 text-lg">
            {t('auth:forgotPassword.secureDescription')}
          </p>
          <div className="space-y-4 text-foreground/80">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-foreground text-xs font-bold">1</span>
              </div>
              <p>{t('auth:forgotPassword.step1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-foreground text-xs font-bold">2</span>
              </div>
              <p>{t('auth:forgotPassword.step2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-foreground text-xs font-bold">3</span>
              </div>
              <p>{t('auth:forgotPassword.step3')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
