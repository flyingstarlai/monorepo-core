import { Outlet, Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { User, Shield } from 'lucide-react';

const settingsNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: Shield,
  },
];

export function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">
          Manage your profile and account settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <nav className="lg:w-64">
          <div className="bg-white rounded-lg p-2">
            <ul className="space-y-1">
              {settingsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
