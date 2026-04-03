'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, redirect } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Bell, LogOut, Settings, Sparkles, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useI18nStore } from '@/stores/i18n';
import { Providers } from '@/components/providers';
import { WiseboxLogo } from '@/components/ui/wisebox-logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '@/hooks/use-notifications';
import type { Notification } from '@/types';

function relativeTime(value: string): string {
  const now = Date.now();
  const then = new Date(value).getTime();
  const minutes = Math.round((now - then) / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const { t } = useTranslation('common');

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHasHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return unsub;
    }
  }, []);

  const user = useAuthStore((s) => s.user);
  const isAdminRole = user?.role === 'admin' || user?.role === 'super_admin';

  if (hasHydrated && isAdminRole && !isAdmin) {
    redirect('/admin/dashboard');
  }

  if (!hasHydrated) {
    return (
      <Providers>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground text-sm">{t('loading')}</div>
        </div>
      </Providers>
    );
  }

  return (
    <Providers>
      <div className="min-h-screen bg-background">
        {!isAdmin && <PortalHeader />}
        <main className={isAdmin ? '' : 'max-w-7xl mx-auto'}>{children}</main>
      </div>
    </Providers>
  );
}

function PortalHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const syncFromProfile = useI18nStore((s) => s.syncFromProfile);
  const { t } = useTranslation('common');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user?.profile?.preferred_language) {
      syncFromProfile(user.profile.preferred_language);
    }
  }, [user?.profile?.preferred_language, syncFromProfile]);

  const isConsultantOnly = user?.role === 'consultant';
  const isAdminRole = user?.role === 'admin' || user?.role === 'super_admin';

  const { data: notificationsData } = useNotifications(6);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = notificationsData?.data ?? [];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLinks = isConsultantOnly
    ? [
        { href: '/consultant', label: t('nav.myCases') },
        { href: '/consultant/tickets', label: t('nav.allTickets') },
        { href: '/settings', label: t('nav.settings') },
      ]
    : [
        { href: '/dashboard', label: t('nav.assets') },
        { href: '/learning', label: t('nav.learning') },
        { href: '/assessment/start', label: t('nav.assessment') },
        { href: '/workspace/services', label: t('nav.services') },
        { href: '/tickets', label: t('nav.tickets') },
        { href: '/settings', label: t('nav.settings') },
      ];

  return (
    <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between max-w-7xl mx-auto h-full px-6 lg:px-8">
        <Link href={isConsultantOnly ? '/consultant' : '/dashboard'}>
          <WiseboxLogo variant="auto" size="sm" className="hover:opacity-90 transition-all duration-200" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
          {isAdminRole && (
            <Link
              href="/admin/dashboard"
              className="text-wisebox-status-warning hover:text-wisebox-status-warning/80 transition-all duration-200"
            >
              {t('nav.adminPanel')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <Bell className="h-5 w-5" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px] bg-card border-border">
              <DropdownMenuLabel className="flex items-center justify-between text-foreground">
                <span>{t('header.notifications')}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => markAllMutation.mutate()}
                  disabled={unreadCount === 0 || markAllMutation.isPending}
                >
                  {t('header.markAllRead')}
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">{t('header.noNotificationsYet')}</div>
              ) : (
                notifications.slice(0, 5).map((notification: Notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-muted"
                    onSelect={() => {
                      if (!notification.read_at) {
                        markReadMutation.mutate(notification.id);
                      }
                    }}
                  >
                    <div className="w-full flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground line-clamp-1">
                        {notification.title}
                      </span>
                      {!notification.read_at && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    {notification.body && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {notification.body}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">{relativeTime(notification.created_at)}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="hover:bg-muted">
                <Link href="/notifications" className="cursor-pointer text-foreground">
                  {t('header.openNotificationCenter')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-muted hover:bg-muted/80 text-foreground h-8 w-8 transition-all duration-200">
                <span className="text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              {user && (
                <>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">{user.email}</div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild className="hover:bg-muted">
                <Link href="/settings" className="cursor-pointer text-foreground">
                  <Settings className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {t('nav.settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:bg-muted">
                <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
                {t('header.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4">
          <nav className="flex flex-col gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
