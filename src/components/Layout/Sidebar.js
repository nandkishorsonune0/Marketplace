import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Logo from '../../assets/Marketplace_Logo.png';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Sidebar() {
  const location = useLocation();
  const user = useSelector(selectUser);

  const navigation = [
    ...(user?.role === 'admin' ? [{ name: 'Dashboard', href: '/', icon: HomeIcon }] : []),
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
    ...(user?.role === 'admin' ? [{ name: 'Users', href: '/users', icon: UsersIcon }] : []),
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Check if current path matches the route
  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <img
            className="h-8 w-auto"
            src={Logo}
            alt="Marketplace"
          />
          <span className="ml-2 text-xl font-semibold text-gray-900">
            Marketplace
          </span>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div>
            <img
              className="inline-block h-9 w-9 rounded-full"
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              alt={user?.name || "User"}
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name || "User"}</p>
            <p className="text-xs font-medium text-gray-500">{user?.role || "User"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
