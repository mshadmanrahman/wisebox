'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileFormState {
  name: string;
  phone: string;
  country_of_residence: string;
  preferred_language: 'en' | 'bn';
  timezone: string;
  order_updates: boolean;
  ticket_updates: boolean;
  consultant_updates: boolean;
  marketing_updates: boolean;
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation('settings');
  const setLanguage = useI18nStore((s) => s.setLanguage);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: '',
    phone: '',
    country_of_residence: '',
    preferred_language: 'en',
    timezone: 'UTC',
    order_updates: true,
    ticket_updates: true,
    consultant_updates: true,
    marketing_updates: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      country_of_residence: user.country_of_residence ?? '',
      preferred_language: user.profile?.preferred_language ?? 'en',
      timezone: user.profile?.timezone ?? 'UTC',
      order_updates: user.profile?.notification_preferences?.order_updates ?? true,
      ticket_updates: user.profile?.notification_preferences?.ticket_updates ?? true,
      consultant_updates: user.profile?.notification_preferences?.consultant_updates ?? true,
      marketing_updates: user.profile?.notification_preferences?.marketing_updates ?? false,
    });
  }, [user]);

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await api.put('/auth/me', {
        name: profileForm.name,
        phone: profileForm.phone || null,
        country_of_residence: profileForm.country_of_residence || null,
        preferred_language: profileForm.preferred_language,
        timezone: profileForm.timezone,
        notification_preferences: {
          order_updates: profileForm.order_updates,
          ticket_updates: profileForm.ticket_updates,
          consultant_updates: profileForm.consultant_updates,
          marketing_updates: profileForm.marketing_updates,
        },
      });

      // Sync i18n store with the selected language
      setLanguage(profileForm.preferred_language);

      await refreshUser();
      toast({
        title: t('profile.savedTitle'),
        description: t('profile.savedDescription'),
      });
    } catch {
      toast({
        title: t('profile.failedTitle'),
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation) {
      toast({
        title: t('password.missingFieldsTitle'),
        description: t('password.missingFieldsDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsSavingPassword(true);

    try {
      await api.put('/auth/change-password', passwordForm);
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      toast({
        title: t('password.updatedTitle'),
      });
    } catch {
      toast({
        title: t('password.failedTitle'),
        description: t('password.failedDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-wisebox-text-primary">{t('title')}</h1>
        <p className="text-wisebox-text-secondary mt-1">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="password">{t('tabs.password')}</TabsTrigger>
          <TabsTrigger value="danger">{t('tabs.danger')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.title')}</CardTitle>
              <CardDescription>{t('profile.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('profile.fullName')}>
                  <Input
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </Field>
                <Field label={t('profile.phone')}>
                  <Input
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </Field>
                <Field label={t('profile.countryIso')}>
                  <Input
                    value={profileForm.country_of_residence}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, country_of_residence: event.target.value.toUpperCase() }))
                    }
                    maxLength={3}
                  />
                </Field>
                <Field label={t('profile.timezone')}>
                  <Input
                    value={profileForm.timezone}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, timezone: event.target.value }))}
                  />
                </Field>
              </div>

              <Field label={t('profile.preferredLanguage')}>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={profileForm.preferred_language === 'en' ? 'default' : 'outline'}
                    onClick={() => setProfileForm((prev) => ({ ...prev, preferred_language: 'en' }))}
                  >
                    {t('profile.english')}
                  </Button>
                  <Button
                    type="button"
                    variant={profileForm.preferred_language === 'bn' ? 'default' : 'outline'}
                    onClick={() => setProfileForm((prev) => ({ ...prev, preferred_language: 'bn' }))}
                  >
                    {t('profile.bangla')}
                  </Button>
                </div>
              </Field>

              <div className="space-y-3">
                <p className="text-sm font-medium text-wisebox-text-primary">{t('profile.emailPreferences')}</p>
                <PreferenceRow
                  label={t('profile.orderUpdates')}
                  checked={profileForm.order_updates}
                  onToggle={() => setProfileForm((prev) => ({ ...prev, order_updates: !prev.order_updates }))}
                />
                <PreferenceRow
                  label={t('profile.ticketUpdates')}
                  checked={profileForm.ticket_updates}
                  onToggle={() => setProfileForm((prev) => ({ ...prev, ticket_updates: !prev.ticket_updates }))}
                />
                <PreferenceRow
                  label={t('profile.consultantUpdates')}
                  checked={profileForm.consultant_updates}
                  onToggle={() => setProfileForm((prev) => ({ ...prev, consultant_updates: !prev.consultant_updates }))}
                />
                <PreferenceRow
                  label={t('profile.marketingUpdates')}
                  checked={profileForm.marketing_updates}
                  onToggle={() => setProfileForm((prev) => ({ ...prev, marketing_updates: !prev.marketing_updates }))}
                />
              </div>

              <Button onClick={saveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? t('profile.saving') : t('profile.saveChanges')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>{t('password.title')}</CardTitle>
              <CardDescription>{t('password.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <Field label={t('password.currentPassword')}>
                <Input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))
                  }
                />
              </Field>
              <Field label={t('password.newPassword')}>
                <Input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </Field>
              <Field label={t('password.confirmPassword')}>
                <Input
                  type="password"
                  value={passwordForm.password_confirmation}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, password_confirmation: event.target.value }))
                  }
                />
              </Field>
              <Button onClick={changePassword} disabled={isSavingPassword}>
                {isSavingPassword ? t('password.updating') : t('password.updatePassword')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">{t('danger.title')}</CardTitle>
              <CardDescription>{t('danger.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-wisebox-text-secondary">
                {t('danger.deleteInfo')}
              </p>
              <Button variant="destructive" disabled>
                {t('danger.deleteButton')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function PreferenceRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-wisebox-background-lighter"
    >
      <span className="text-sm text-wisebox-text-primary">{label}</span>
      <span
        className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
          checked ? 'bg-wisebox-primary-600 justify-end' : 'bg-wisebox-background-lighter justify-start'
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white" />
      </span>
    </button>
  );
}
