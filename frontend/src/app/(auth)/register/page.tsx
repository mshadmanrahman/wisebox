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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const COUNTRIES = [
  { code: 'BGD', name: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}' },
  { code: 'USA', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'GBR', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'CAN', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}' },
  { code: 'AUS', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}' },
  { code: 'SWE', name: 'Sweden', flag: '\u{1F1F8}\u{1F1EA}' },
  { code: 'ARE', name: 'UAE', flag: '\u{1F1E6}\u{1F1EA}' },
  { code: 'SAU', name: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}' },
  { code: 'MYS', name: 'Malaysia', flag: '\u{1F1F2}\u{1F1FE}' },
  { code: 'SGP', name: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}' },
  { code: 'IND', name: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'DEU', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'ITA', name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: 'JPN', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'KOR', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}' },
];

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  country_of_residence: z.string().length(3, 'Please select a country'),
  terms_accepted: z.boolean().refine((v) => v === true, 'You must accept the terms'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const STEPS = [
  { title: 'Your Name', description: 'Tell us who you are' },
  { title: 'Password', description: 'Secure your account' },
  { title: 'Country', description: 'Where do you live?' },
  { title: 'Terms', description: 'Review and accept' },
  { title: 'Verify', description: 'Confirm your email' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');

  const {
    register,
    handleSubmit,
    trigger,
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

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    switch (step) {
      case 0:
        fieldsToValidate = ['name', 'email'];
        break;
      case 1:
        fieldsToValidate = ['password', 'password_confirmation'];
        break;
      case 2:
        fieldsToValidate = ['country_of_residence'];
        break;
      case 3:
        fieldsToValidate = ['terms_accepted'];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step === 3) {
        await onSubmit();
      } else {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const onSubmit = async () => {
    setError(null);
    const values = watch();
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        country_of_residence: values.country_of_residence,
        terms_accepted: values.terms_accepted,
      });
      setStep(4);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const serverErrors = error.response?.data?.errors;
      if (serverErrors?.email) {
        setError(serverErrors.email[0]);
        setStep(0);
      } else {
        setError(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  const handleVerifyOtp = async () => {
    // TODO: Call verify-otp endpoint
    router.push('/dashboard');
  };

  return (
    <>
      <div className="text-center mb-8 lg:hidden">
        <h1 className="text-2xl font-bold text-teal-700">Wisebox</h1>
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-teal-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-2xl font-bold">{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 0: Name and Email */}
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </>
            )}

            {/* Step 1: Password */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm password</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    {...register('password_confirmation')}
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-red-500">{errors.password_confirmation.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Country */}
            {step === 2 && (
              <div className="space-y-2">
                <Label>Country of residence</Label>
                <Select
                  value={watchedCountry}
                  onValueChange={(value) => setValue('country_of_residence', value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country_of_residence && (
                  <p className="text-sm text-red-500">{errors.country_of_residence.message}</p>
                )}
              </div>
            )}

            {/* Step 3: Terms */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 max-h-48 overflow-y-auto">
                  <p className="font-medium mb-2">Terms of Service</p>
                  <p>By creating a Wisebox account, you agree to our Terms of Service and Privacy Policy. Your documents are encrypted and stored securely. We will never share your personal information without your consent.</p>
                  <p className="mt-2">You acknowledge that Wisebox provides a platform for property management and document verification. Legal advice provided through the platform is for informational purposes. Always consult a licensed attorney for legal decisions.</p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    {...register('terms_accepted')}
                  />
                  <span className="text-sm text-gray-700">
                    I accept the Terms of Service and Privacy Policy
                  </span>
                </label>
                {errors.terms_accepted && (
                  <p className="text-sm text-red-500">{errors.terms_accepted.message}</p>
                )}
              </div>
            )}

            {/* Step 4: OTP Verification */}
            {step === 4 && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-gray-700">
                  We sent a verification code to your email. Enter it below to complete registration.
                </p>
                <div className="space-y-2">
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={handleVerifyOtp}
                  disabled={otpCode.length !== 6}
                >
                  Verify and continue
                </Button>
                <button type="button" className="text-sm text-teal-600 hover:underline">
                  Resend code
                </button>
              </div>
            )}

            {/* Navigation buttons (steps 0-3) */}
            {step < 4 && (
              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  className={`flex-1 bg-teal-600 hover:bg-teal-700 ${step === 0 ? 'w-full' : ''}`}
                  onClick={nextStep}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : step === 3 ? (
                    'Create account'
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>

          {step < 4 && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
