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
    <nav className="bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white text-xl font-bold">
                FreeBooks Sekondi
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`${
                    link.current
                      ? 'border-primary text-white'
                      : 'border-transparent text-white hover:border-gray-300 hover:text-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            <Popover className="relative">
              <Popover.Button className="flex items-center text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary rounded-md p-2">
                <UserCircleIcon className="h-6 w-6 mr-2" />
                <span className="text-sm font-medium">{user?.username}</span>
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
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
                <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role} User</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded="false"
              aria-label="Open main menu"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={mobileMenuOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary bg-opacity-95">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`${
                  link.current
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile user info and logout */}
            <div className="border-t border-white border-opacity-20 pt-4 mt-4">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-white text-opacity-80">{user?.email}</p>
                <p className="text-xs text-white text-opacity-80 capitalize">{user?.role} User</p>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white hover:bg-opacity-10 rounded-md"
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