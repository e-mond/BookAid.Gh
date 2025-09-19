import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Popover } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  DocumentPlusIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'school', 'staff'] }
    ];

    if (hasRole('school')) {
      items.push({ 
        name: 'Submit List', 
        href: '/submit', 
        icon: DocumentPlusIcon, 
        roles: ['school'] 
      });
    }

    if (hasRole('admin')) {
      items.push(
        { 
          name: 'Approve Schools', 
          href: '/admin/approve', 
          icon: ClipboardDocumentCheckIcon, 
          roles: ['admin'] 
        },
        { 
          name: 'Reports', 
          href: '/reports', 
          icon: ChartBarIcon, 
          roles: ['admin'] 
        }
      );
    }

    if (hasRole('staff') || hasRole('admin')) {
      items.push({ 
        name: 'Collection', 
        href: '/collect', 
        icon: UserGroupIcon, 
        roles: ['staff', 'admin'] 
      });
    }

    if (hasRole('admin') || hasRole('staff')) {
      items.push({ 
        name: 'Reports', 
        href: '/reports', 
        icon: ChartBarIcon, 
        roles: ['admin', 'staff'] 
      });
    }

    return items.filter(item => 
      item.roles.includes(user?.role)
    );
  };

  const navigationItems = getNavigationItems();

  // Check if current path is active
  const isActivePath = (href) => {
    return location.pathname === href;
  };

  return (
    <nav className="bg-primary shadow-lg fixed w-full top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors">
              <BookOpenIcon className="h-8 w-8" aria-hidden="true" />
              <span className="font-bold text-lg">FreeBooks Sekondi</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary ${
                    isActivePath(item.href)
                      ? 'bg-primary-hover text-white'
                      : 'text-white hover:bg-primary-hover hover:text-white'
                  }`}
                  aria-current={isActivePath(item.href) ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* User info and logout */}
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-primary-hover">
              <div className="text-white text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-gray-200 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary rounded-md px-2 py-1"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary rounded-md p-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </Popover.Button>

                  <Popover.Panel className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                      </div>

                      {/* Navigation items */}
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                              isActivePath(item.href)
                                ? 'bg-primary text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            aria-current={isActivePath(item.href) ? 'page' : undefined}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </Popover.Panel>
                </>
              )}
            </Popover>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;