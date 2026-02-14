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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

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
      // Redirect to OTP verification
      router.push('/verify?email=' + encodeURIComponent(data.email));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const serverErrors = error.response?.data?.errors;
      if (serverErrors?.email) {
        setError(serverErrors.email[0]);
      } else {
        setError(error.response?.data?.message || 'Registration failed. Please try again.');
      }
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
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-wisebox-text-secondary">
              Start digitizing your inherited land records today.
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
                Full name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                autoComplete="name"
                className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted h-12"
                {...register('name')}
              />
              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                autoComplete="email"
                className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted h-12"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted h-12"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Country of residency</Label>
              <Select
                value={watchedCountry}
                onValueChange={(value) => setValue('country_of_residence', value, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-wisebox-background-input border-wisebox-border text-white h-12">
                  <SelectValue placeholder="Select your country" />
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
                I agree to the{' '}
                <Link href="/terms" className="text-wisebox-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-wisebox-primary hover:underline">
                  Privacy Policy.
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
                  Creating account...
                </>
              ) : (
                'Create Account'
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

            <Button
              type="button"
              variant="outline"
              className="w-full border-wisebox-border text-white hover:bg-wisebox-background-lighter h-12"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-wisebox-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-medium hover:underline">
                Log in
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
            src="/images/auth/register-testimonial.jpg"
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
            <span>Sydney, Australia</span>
          </div>

          {/* Testimonial */}
          <div className="max-w-xl space-y-4 bg-gradient-to-t from-black/60 to-transparent p-8 rounded-2xl backdrop-blur-sm">
            <svg className="w-10 h-10 text-white/80" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="text-lg leading-relaxed">
              As a grandfather, I find great comfort in knowing that WiseBox allows me to manage our
              family&apos;s properties in Bangladesh from my home in Toronto. I can easily keep track of all
              the important documents and transactions, ensuring that my children and grandchildren
              will inherit not just assets, but also the wisdom and guidance they need to navigate their
              future.
            </p>
            <div>
              <p className="font-semibold">Enayet Chowdhury</p>
              <p className="text-sm text-white/80">Retd. Physician</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
