'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Shield,
  Users,
  BrainCircuit,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Audit Logs',
    href: '/audit',
    icon: FileText,
  },
  {
    title: 'Trades',
    href: '/trades',
    icon: TrendingUp,
  },
  {
    title: 'Policies',
    href: '/policies',
    icon: Shield,
  },
  {
    title: 'Actors',
    href: '/actors',
    icon: Users,
  },
  {
    title: 'Advisories',
    href: '/advisories',
    icon: BrainCircuit,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Audit AI Trading</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">v0.1.0 - Development</p>
      </div>
    </div>
  );
}
