'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    // persist API only available client-side; check if already hydrated
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHasHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return unsub;
    }
  }, []);

  // Prevent rendering with stale default state before Zustand hydration
  if (!hasHydrated) {
    return (
      <Providers>
        <div className="min-h-screen bg-wisebox-background flex items-center justify-center">
          <div className="text-wisebox-text-secondary text-sm">Loading...</div>
        </div>
      </Providers>
    );
  }

  return (
    <Providers>
      <div className="min-h-screen bg-wisebox-background">
        <PortalHeader />
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
    </Providers>
  );
}

function PortalHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isConsultantOnly = user?.role === 'consultant';
  const isAdminRole =
    user?.role === 'admin' || user?.role === 'super_admin';


  const { data: notificationsData } = useNotifications(6);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = notificationsData?.data ?? [];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-wisebox-background-card border-b border-wisebox-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
        <Link href={isConsultantOnly ? '/consultant' : '/dashboard'}>
          <WiseboxLogo variant="light" className="hover:opacity-90 transition-opacity" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {isConsultantOnly ? (
            <>
              <Link href="/consultant" className="text-wisebox-text-secondary hover:text-white transition-colors">
                My Cases
              </Link>
              <Link href="/consultant/tickets" className="text-wisebox-text-secondary hover:text-white transition-colors">
                All Tickets
              </Link>
              <Link href="/settings" className="text-wisebox-text-secondary hover:text-white transition-colors">
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link href="/properties" className="text-wisebox-text-secondary hover:text-white transition-colors">
                Assets
              </Link>
              <Link href="/learning" className="text-wisebox-text-secondary hover:text-white transition-colors">
                Learning
              </Link>
              <Link href="/assessment/start" className="text-wisebox-text-secondary hover:text-white transition-colors">
                Assessment
              </Link>
              <Link href="/workspace/services" className="text-wisebox-text-secondary hover:text-white transition-colors">
                Services
              </Link>
              <Link href="/tickets" className="text-wisebox-text-secondary hover:text-white transition-colors">
                Tickets
              </Link>
              <Link href="/settings" className="text-wisebox-text-secondary hover:text-white transition-colors">
                Settings
              </Link>
              {isAdminRole && (
                <Link href="/admin/dashboard" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Admin Panel
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-wisebox-background-lighter">
            <Sparkles className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-wisebox-background-lighter">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-wisebox-primary text-white text-[10px] leading-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px] bg-wisebox-background-card border-wisebox-border">
              <DropdownMenuLabel className="flex items-center justify-between text-white">
                <span>Notifications</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-wisebox-text-secondary hover:text-white hover:bg-wisebox-background-lighter"
                  onClick={() => markAllMutation.mutate()}
                  disabled={unreadCount === 0 || markAllMutation.isPending}
                >
                  Mark all read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-wisebox-border" />
              {notifications.length === 0 ? (
                <div className="px-2 py-4 text-sm text-wisebox-text-secondary">No notifications yet.</div>
              ) : (
                notifications.slice(0, 5).map((notification: Notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-wisebox-background-lighter"
                    onSelect={() => {
                      if (!notification.read_at) {
                        markReadMutation.mutate(notification.id);
                      }
                    }}
                  >
                    <div className="w-full flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-white line-clamp-1">
                        {notification.title}
                      </span>
                      {!notification.read_at && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-wisebox-primary" />
                      )}
                    </div>
                    {notification.body && (
                      <span className="text-xs text-wisebox-text-secondary line-clamp-2">
                        {notification.body}
                      </span>
                    )}
                    <span className="text-[11px] text-wisebox-text-muted">{relativeTime(notification.created_at)}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator className="bg-wisebox-border" />
              <DropdownMenuItem asChild className="hover:bg-wisebox-background-lighter">
                <Link href="/notifications" className="cursor-pointer text-white">
                  Open notification center
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-wisebox-text-muted/20 hover:bg-wisebox-text-muted/30 text-white h-8 w-8">
                <span className="text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-wisebox-background-card border-wisebox-border">
              {user && (
                <>
                  <div className="px-2 py-1.5 text-sm text-wisebox-text-secondary truncate">{user.email}</div>
                  <DropdownMenuSeparator className="bg-wisebox-border" />
                </>
              )}
              <DropdownMenuItem asChild className="hover:bg-wisebox-background-lighter">
                <Link href="/settings" className="cursor-pointer text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:bg-wisebox-background-lighter">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
