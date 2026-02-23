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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { AuthTestimonialCarousel } from '@/components/auth/testimonial-carousel';
import { WiseboxLogo } from '@/components/ui/wisebox-logo';

const COUNTRIES = [
  { code: 'BGD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'USA', name: 'United States', flag: '🇺🇸' },
  { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
  { code: 'SWE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'ARE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SAU', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'MYS', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SGP', name: 'Singapore', flag: '🇸🇬' },
  { code: 'IND', name: 'India', flag: '🇮🇳' },
  { code: 'DEU', name: 'Germany', flag: '🇩🇪' },
  { code: 'ITA', name: 'Italy', flag: '🇮🇹' },
];

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  country_of_residence: z.string().min(3, 'Please select a country'),
  terms_accepted: z.boolean().refine((v) => v === true, 'You must accept the terms'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const { googleButtonRef, error: googleError } = useGoogleAuth();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(['auth', 'common']);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms_accepted: false,
    },
  });

  const watchedCountry = watch('country_of_residence');

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
        country_of_residence: data.country_of_residence,
        terms_accepted: data.terms_accepted,
      });
      // Go straight to dashboard (lazy verification: verify email later when needed)
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const serverErrors = error.response?.data?.errors;
      if (serverErrors?.email) {
        setError(serverErrors.email[0]);
      } else {
        setError(error.response?.data?.message || t('auth:register.registrationFailed'));
      }
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
            <h1 className="text-3xl font-bold text-white mb-2">{t('auth:register.title')}</h1>
            <p className="text-wisebox-text-secondary">
              {t('auth:register.subtitle')}
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
              <Label htmlFor="name" className="text-white text-sm font-medium">
                {t('auth:register.nameLabel')}
              </Label>
              <Input
                id="name"
                placeholder={t('auth:register.namePlaceholder')}
                autoComplete="name"
                className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted h-12"
                {...register('name')}
              />
              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                {t('auth:register.emailLabel')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth:register.emailPlaceholder')}
                autoComplete="email"
                className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted h-12"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                {t('auth:register.passwordLabel')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth:register.passwordPlaceholder')}
                autoComplete="new-password"
                className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted h-12"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">{t('auth:register.countryLabel')}</Label>
              <Select
                value={watchedCountry}
                onValueChange={(value) => setValue('country_of_residence', value, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-wisebox-background-input border-wisebox-border text-white h-12">
                  <SelectValue placeholder={t('auth:register.countryPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                  {COUNTRIES.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      className="text-white hover:bg-wisebox-background-lighter"
                    >
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country_of_residence && (
                <p className="text-sm text-red-400">{errors.country_of_residence.message}</p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-wisebox-border bg-wisebox-background-input checked:bg-wisebox-primary checked:border-wisebox-primary focus:ring-wisebox-primary focus:ring-offset-wisebox-background"
                {...register('terms_accepted')}
              />
              <label htmlFor="terms" className="text-sm text-wisebox-text-secondary">
                {t('auth:register.termsAgree')}{' '}
                <Link href="/terms" className="text-wisebox-primary hover:underline">
                  {t('common:termsOfService')}
                </Link>{' '}
                {t('auth:register.termsAnd')}{' '}
                <Link href="/privacy" className="text-wisebox-primary hover:underline">
                  {t('common:privacyPolicy')}.
                </Link>
              </label>
            </div>
            {errors.terms_accepted && <p className="text-sm text-red-400">{errors.terms_accepted.message}</p>}

            <Button
              type="submit"
              className="w-full bg-white hover:bg-gray-100 text-wisebox-background h-12 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth:register.submitting')}
                </>
              ) : (
                t('auth:register.submit')
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-wisebox-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-wisebox-background px-2 text-wisebox-text-muted">{t('auth:register.orContinueWith')}</span>
              </div>
            </div>

            <div ref={googleButtonRef} className="w-full flex justify-center" />
            {googleError && (
              <p className="text-sm text-red-400 text-center">{googleError}</p>
            )}

            <p className="text-center text-sm text-wisebox-text-secondary">
              {t('auth:register.hasAccount')}{' '}
              <Link href="/login" className="text-white font-medium hover:underline">
                {t('auth:register.logIn')}
              </Link>
            </p>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-wisebox-border">
            <p className="text-xs text-wisebox-text-muted text-center">
              {t('common:copyright')}
            </p>
            <div className="flex justify-center gap-6 mt-2">
              <Link href="/privacy" className="text-xs text-wisebox-text-muted hover:text-white">
                {t('common:privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-xs text-wisebox-text-muted hover:text-white">
                {t('common:termsOfService')}
              </Link>
              <Link href="/help" className="text-xs text-wisebox-text-muted hover:text-white">
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
