import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plane,
  Shield,
  Sun,
  User,
  X,
  Cpu,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { SystemArchitectureDrawer } from '../common/SystemArchitectureDrawer';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isArchDrawerOpen, setIsArchDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 shadow-lg shadow-black/10 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-3.5 group"
          aria-label="AeroPulse home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <Plane className="h-5 w-5 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
          </span>

          <span className="leading-none">
            <span className="block text-2xl font-black tracking-tight text-white font-['Outfit']">
              AERO<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-amber-400">PULSE</span>
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/flights"
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              isActive('/flights')
                ? 'bg-primary-500/10 text-primary-300'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            Book flights
          </Link>

          <button
            type="button"
            onClick={() => setIsArchDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition-colors cursor-pointer"
            title="Inspect System Architecture"
          >
            <Cpu className="h-4 w-4" /> Tech Stack
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-900 hover:text-white cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <span className="mx-2 h-7 w-px bg-slate-800" />

          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={user?.role === 'admin' ? Shield : LayoutDashboard}
                  className="border-slate-700 text-slate-200 hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-300 cursor-pointer"
                >
                  {user?.role === 'admin' ? 'Admin panel' : 'My trips'}
                </Button>
              </Link>

              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard/profile'}
                className="ml-2 flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/15 text-sm font-bold text-primary-300">
                  {user?.firstName?.[0]?.toUpperCase() || (
                    <User className="h-4 w-4" />
                  )}
                </span>

                <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-200 lg:block">
                  {user?.firstName || 'Profile'}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-200 hover:bg-slate-900 hover:text-white cursor-pointer"
                >
                  Sign in
                </Button>
              </Link>

              <Link to="/register">
                <Button
                  size="sm"
                  className="whitespace-nowrap bg-primary-600 px-4 shadow-lg shadow-primary-600/20 hover:bg-primary-500 cursor-pointer"
                >
                  Create account
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((previous) => !previous)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            <Link
              to="/flights"
              onClick={closeMenu}
              className="block w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-900 hover:text-primary-300"
            >
              Book flights
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-900 hover:text-primary-300"
                >
                  {user?.role === 'admin' ? 'Admin panel' : 'My trips'}
                </Link>

                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard/profile'}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-900 hover:text-primary-300"
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4">
                <Link to="/login" onClick={closeMenu}>
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-slate-200"
                  >
                    Sign in
                  </Button>
                </Link>

                <Link to="/register" onClick={closeMenu}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Architecture Drawer */}
      <SystemArchitectureDrawer
        isOpen={isArchDrawerOpen}
        onClose={() => setIsArchDrawerOpen(false)}
      />
    </header>
  );
};