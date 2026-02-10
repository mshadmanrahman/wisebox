'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { Providers } from '@/components/providers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '@/hooks/use-notifications';
import type { Notification } from '@/types';

const baseNavLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/properties', label: 'Properties' },
  { href: '/workspace/services', label: 'Services' },
  { href: '/orders', label: 'Orders' },
  { href: '/tickets', label: 'Tickets' },
];

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
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <PortalHeader />
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
    </Providers>
  );
}

function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isConsultantRole =
    user?.role === 'consultant' || user?.role === 'admin' || user?.role === 'super_admin';

  const navLinks = isConsultantRole
    ? [...baseNavLinks, { href: '/consultant/tickets', label: 'Consultant' }]
    : baseNavLinks;

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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-8 min-w-0">
          <Link href="/dashboard" className="text-xl font-bold text-wisebox-primary-700">
            Wisebox
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-wisebox-primary-50 text-wisebox-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-wisebox-primary-600 text-white text-[10px] leading-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px]">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => markAllMutation.mutate()}
                  disabled={unreadCount === 0 || markAllMutation.isPending}
                >
                  Mark all read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">No notifications yet.</div>
              ) : (
                notifications.slice(0, 5).map((notification: Notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                    onSelect={() => {
                      if (!notification.read_at) {
                        markReadMutation.mutate(notification.id);
                      }
                    }}
                  >
                    <div className="w-full flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-wisebox-text-primary line-clamp-1">
                        {notification.title}
                      </span>
                      {!notification.read_at && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-wisebox-primary-600" />
                      )}
                    </div>
                    {notification.body && (
                      <span className="text-xs text-wisebox-text-secondary line-clamp-2">
                        {notification.body}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">{relativeTime(notification.created_at)}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="cursor-pointer">
                  Open notification center
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="max-w-[140px] truncate">{user?.name ?? 'Account'}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user && (
                <>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">{user.email}</div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
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
