'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  BellIcon, 
  SunIcon, 
  MoonIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Mock notifications
  const notifications = [
    { id: 1, text: 'New assignment uploaded in Web Development', time: '5 min ago' },
    { id: 2, text: 'Your quiz submission was graded', time: '1 hour ago' },
    { id: 3, text: 'Class schedule changed for tomorrow', time: '3 hours ago' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 right-0 left-0 z-20 ml-64">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <span className="text-gray-700 dark:text-gray-200">
                Welcome, {session?.user?.name || 'User'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
            
            {/* Notifications dropdown */}
            <div className="relative ml-3">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                aria-label="View notifications"
              >
                <span className="absolute -top-0.5 right-0 h-4 w-4 text-xs rounded-full bg-red-500 text-white flex items-center justify-center">
                  {notifications.length}
                </span>
                <BellIcon className="h-6 w-6" />
              </button>
              
              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</p>
                  </div>
                  {notifications.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.map((notification) => (
                        <a
                          key={notification.id}
                          href="#"
                          className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0"
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-200">{notification.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No new notifications
                    </div>
                  )}
                  <div className="border-t border-gray-100 dark:border-gray-600">
                    <a
                      href="#"
                      className="block text-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile dropdown */}
            <div className="relative ml-3">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none"
                id="user-menu"
                aria-haspopup="true"
              >
                {session?.user?.image ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || "User profile"}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserCircleIcon className="h-7 w-7 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <span className="ml-2 text-gray-700 dark:text-gray-200 hidden sm:block">
                  {session?.user?.name?.split(' ')[0] || 'User'}
                </span>
                <span className="ml-1 text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full dark:bg-blue-900 dark:text-blue-100">
                  {session?.user?.role || 'User'}
                </span>
              </button>
              
              {isProfileMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <Link
                    href="/settings/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      // Other sign out logic if needed
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 