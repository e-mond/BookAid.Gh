import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';

/**
 * Navbar component with responsive design and role-based navigation
 * Uses Headless UI for mobile menu and accessibility
 */
const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'school', 'staff'] },
    ];

    if (hasRole('school')) {
      baseItems.push({
        name: 'Submit List',
        href: '/school-submission',
        icon: ClipboardDocumentListIcon,
        roles: ['school']
      });
    }

    if (hasRole('admin')) {
      baseItems.push({
        name: 'Admin Approval',
        href: '/admin-approval',
        icon: BookOpenIcon,
        roles: ['admin']
      });
    }

    if (hasRole('staff')) {
      baseItems.push({
        name: 'Parent Collection',
        href: '/parent-collection',
        icon: UserIcon,
        roles: ['staff']
      });
    }

    baseItems.push({
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      roles: ['admin', 'staff']
    });

    return baseItems.filter(item => item.roles.includes(user.role));
  };

  const navigationItems = getNavigationItems();

  // Check if current path is active
  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <nav className="bg-blue-600 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8 text-white" />
              <span className="text-white text-xl font-bold">
                FreeBooks Sekondi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-sm'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-2 text-blue-100">
              <UserIcon className="h-5 w-5" />
              <span className="text-sm">
                {user?.name} ({user?.role})
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-600"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-blue-100 hover:text-white p-2"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <Transition
        show={mobileMenuOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-sm'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile User Info */}
            <div className="border-t border-blue-700 pt-4 mt-4">
              <div className="flex items-center space-x-2 px-3 py-2 text-blue-100">
                <UserIcon className="h-5 w-5" />
                <span className="text-sm">
                  {user?.name} ({user?.role})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg text-base font-medium transition-all duration-200 hover:shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;