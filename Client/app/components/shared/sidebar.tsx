'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { UserRole } from '@/app/lib/auth';
import {
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  TrophyIcon,
  HomeIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  CogIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

type SidebarLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
};

const links: SidebarLink[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <HomeIcon className="h-5 w-5" />,
    roles: ['admin', 'faculty', 'student'],
  },
  // Admin links
  {
    name: 'User Management',
    href: '/admin/users',
    icon: <UsersIcon className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    name: 'Course Management',
    href: '/admin/courses',
    icon: <BookOpenIcon className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: <ChartBarIcon className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    name: 'System Monitoring',
    href: '/admin/monitoring',
    icon: <ChartBarIcon className="w-6 h-6" />,
    roles: ['admin'],
  },
  {
    name: 'Announcements',
    href: '/admin/announcements',
    icon: <BellIcon className="w-6 h-6" />,
    roles: ['admin'],
  },
  // Faculty links
  {
    name: 'My Courses',
    href: '/faculty/courses',
    icon: <BookOpenIcon className="h-5 w-5" />,
    roles: ['faculty'],
  },
  {
    name: 'Assignments',
    href: '/faculty/assignments',
    icon: <DocumentTextIcon className="h-5 w-5" />,
    roles: ['faculty'],
  },
  {
    name: 'Grades',
    href: '/faculty/grades',
    icon: <CheckCircleIcon className="h-5 w-5" />,
    roles: ['faculty'],
  },
  // Student links
  {
    name: 'My Courses',
    href: '/student/courses',
    icon: <BookOpenIcon className="h-5 w-5" />,
    roles: ['student'],
  },
  {
    name: 'Assignments',
    href: '/student/assignments',
    icon: <DocumentTextIcon className="h-5 w-5" />,
    roles: ['student'],
  },
  {
    name: 'Quizzes',
    href: '/student/quizzes',
    icon: <QuestionMarkCircleIcon className="h-5 w-5" />,
    roles: ['student'],
  },
  {
    name: 'Grades',
    href: '/student/grades',
    icon: <CheckCircleIcon className="h-5 w-5" />,
    roles: ['student'],
  },
  // Shared links
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: <TrophyIcon className="w-6 h-6" />,
    roles: ['faculty', 'student'],
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
    roles: ['faculty', 'student'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: <CogIcon className="h-5 w-5" />,
    roles: ['admin', 'faculty', 'student'],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'student';

  const filteredLinks = links.filter(link => link.roles.includes(userRole as UserRole));

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } h-screen bg-gray-800 text-white fixed left-0 top-0 transition-all duration-300 z-10`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="text-xl font-bold">
            <span className="text-blue-500">E</span>-Learning
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-1 rounded-md hover:bg-gray-700 ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <ChevronRightIcon className="w-6 h-6" /> : <ChevronLeftIcon className="w-6 h-6" />}
        </button>
      </div>

      <div className="py-4">
        <nav>
          <ul className="space-y-2">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                      isActive ? 'bg-gray-700 text-white border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <span className={`${collapsed ? 'mx-auto' : ''}`}>{link.icon}</span>
                    {!collapsed && <span className="ml-3">{link.name}</span>}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <span className={`${collapsed ? 'mx-auto' : ''}`}>
                  <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                </span>
                {!collapsed && <span className="ml-3">Sign Out</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
} 