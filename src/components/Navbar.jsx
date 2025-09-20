import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Popover, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAdmin, isStaff, isSchool } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getRoleBasedLinks = () => {
    if (isAdmin) {
      return [
        { path: '/', label: 'Dashboard' },
        { path: '/admin/users', label: 'User Management' },
        { path: '/admin/books', label: 'Book Records' },
        { path: '/admin/approval', label: 'School Approval' },
        { path: '/admin/add-school', label: 'Add School' },
        { path: '/admin/parental-collect', label: 'Parental Collection' },
        { path: '/reports', label: 'Reports' }
      ];
    } else if (isStaff) {
      return [
        { path: '/', label: 'Dashboard' },
        { path: '/staff/delivery', label: 'Delivery Entry' },
        { path: '/staff/parental-collect', label: 'Parental Collection' },
        { path: '/reports', label: 'Reports' }
      ];
    } else if (isSchool) {
      return [
        { path: '/', label: 'Dashboard' },
        { path: '/school/submission', label: 'Submit Student List' },
        { path: '/reports', label: 'Reports' }
      ];
    }
    return [];
  };

  const getRoleBasedBg = () => {
    if (isStaff) return 'bg-blue-50';
    if (isSchool) return 'bg-green-50';
    return 'bg-gray-50';
  };

  const links = getRoleBasedLinks();

  return (
    <nav className={`${getRoleBasedBg()} shadow-sm border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                FreeBooks Sekondi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:text-primary hover:bg-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {user?.username} ({user?.role})
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
              aria-label="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Popover.Button>

                  <Transition
                    as={React.Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Popover.Panel className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        {links.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            className={`block px-4 py-2 text-sm ${
                              isActive(link.path)
                                ? 'bg-primary text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {link.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100">
                          <div className="px-4 py-2 text-sm text-gray-500">
                            {user?.username} ({user?.role})
                          </div>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
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