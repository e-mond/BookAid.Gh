import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Popover, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getRoleBasedLinks = () => {
    if (!user) return [];

    const baseLinks = [
      { name: 'Dashboard', href: '/', current: location.pathname === '/' }
    ];

    if (user.role === 'admin') {
      return [
        ...baseLinks,
        { name: 'User Management', href: '/admin/users', current: location.pathname === '/admin/users' },
        { name: 'Book Records', href: '/admin/books', current: location.pathname === '/admin/books' },
        { name: 'School Approvals', href: '/admin/approvals', current: location.pathname === '/admin/approvals' },
        { name: 'Reports', href: '/reports', current: location.pathname === '/reports' }
      ];
    } else if (user.role === 'staff') {
      return [
        ...baseLinks,
        { name: 'Delivery Entry', href: '/staff/delivery', current: location.pathname === '/staff/delivery' },
        { name: 'Parent Collection', href: '/staff/collection', current: location.pathname === '/staff/collection' },
        { name: 'Reports', href: '/reports', current: location.pathname === '/reports' }
      ];
    } else if (user.role === 'school') {
      return [
        ...baseLinks,
        { name: 'Submit School Data', href: '/school/submit', current: location.pathname === '/school/submit' },
        { name: 'My Submissions', href: '/school/submissions', current: location.pathname === '/school/submissions' }
      ];
    }

    return baseLinks;
  };

  const links = getRoleBasedLinks();

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-white text-2xl font-bold tracking-tight">
              BookAid Gh.
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`${
                  link.current
                    ? 'border-indigo-300 text-white'
                    : 'border-transparent text-white hover:border-indigo-200 hover:text-indigo-100'
                } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all duration-300 ease-in-out`}
                aria-current={link.current ? 'page' : undefined}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex md:items-center">
            <Popover className="relative">
              <Popover.Button
                className="flex items-center text-white hover:text-indigo-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 rounded-md p-2 transition-all duration-200"
                aria-label="User menu"
              >
                <UserCircleIcon className="h-7 w-7 mr-2" />
                <span className="text-sm font-semibold">{user?.username}</span>
                <span className="ml-2 text-xs bg-indigo-800 bg-opacity-50 px-2 py-1 rounded-full capitalize">
                  {user?.role}
                </span>
              </Popover.Button>

              <Transition
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 z-20 mt-3 w-56 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role} User</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:text-indigo-100 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle main menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={mobileMenuOpen}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden bg-indigo-600 bg-opacity-95">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`${
                  link.current
                    ? 'bg-indigo-700 text-white'
                    : 'text-white hover:bg-indigo-700 hover:text-indigo-100'
                } block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200`}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={link.current ? 'page' : undefined}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile user info and logout */}
            <div className="border-t border-indigo-400 border-opacity-50 pt-4 mt-4">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-indigo-100 truncate">{user?.email}</p>
                <p className="text-xs text-indigo-100 capitalize">{user?.role} User</p>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-indigo-700 hover:text-indigo-100 rounded-lg transition-all duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;