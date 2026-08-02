import  { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { Plane, LayoutDashboard, Calendar, Ticket, Users, BarChart3, LogOut, Sun, Moon, Menu, X, ArrowLeft } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Flights', path: '/admin/flights', icon: Calendar },
    { label: 'Bookings', path: '/admin/bookings', icon: Ticket },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* sidebar of desktop */}

      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-400">
       {/* logo */}
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary-600 rounded-lg text-white">
              <Plane className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              AEROPULSE <span className="text-xs bg-primary-600/20 text-primary-400 border border-primary-500/20 px-1.5 py-0.5 rounded font-mono ml-1">ADMIN</span>
            </span>
          </Link>
        </div>

           {/* navlinks */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/10'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

         {/* theme button */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white"
          >
            <span className="flex items-center gap-3">
              {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
              Theme
            </span>
            <span className="text-xs text-slate-400">{isDark ? 'Dark' : 'Light'}</span>
          </button>

           {/* logout button */}
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* main wrapper i.e the content on the rightside of the sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Portal
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold dark:text-amber-500">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-700 dark:text-red-300 font-bold border border-red-200/50 dark:border-red-800/30">
              A
            </div>
          </div>
        </header>

        {/* content body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <Outlet />
        </main>
      </div>

      {/* mobile drawer sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          {/* this will make the bg blur when the sidebar opens and when you will click anywhere out of the sidebar then the sidebar gets closed */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />

          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-10 text-slate-400">
            {/* header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
              <Link to="/" className="flex items-center gap-2">
                <div className="p-2 bg-primary-600 rounded-lg text-white ">
                <Plane className="h-6 w-6 animate-float" />
                  </div>
                <span className="text-xl font-bold text-white">AEROPULSE</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>


             {/* navlinks */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
  
              {/* toggle theme */}
            <div className="p-4 border-t border-slate-800 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
                  Theme
                </span>
              </button>

              {/* logout button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
