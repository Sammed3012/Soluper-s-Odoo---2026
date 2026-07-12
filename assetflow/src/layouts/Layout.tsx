import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  CalendarDays, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import Background3D from '../components/Background3D';

export default function Layout() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ...(user?.role === 'Admin' ? [{ name: 'Organization', path: '/organization', icon: Building2 }] : []),
    { name: 'Assets', path: '/assets', icon: Package },
    { name: 'Bookings', path: '/bookings', icon: CalendarDays },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Audit', path: '/audit', icon: ClipboardCheck },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Activity', path: '/activity', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-transparent flex relative text-gray-900">
      <Background3D />
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600">AssetFlow</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center px-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <header className="md:hidden bg-white/80 backdrop-blur-md h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600">AssetFlow</span>
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-500 hover:text-gray-700">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white z-50">
              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                <span className="text-xl font-bold text-indigo-600">AssetFlow</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center px-3 py-2 text-base font-medium rounded-md",
                          isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Icon className={cn("mr-4 h-6 w-6", isActive ? "text-indigo-600" : "text-gray-400")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center px-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
