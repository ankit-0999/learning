'use client';

import React from 'react';
import Card from '@/app/components/ui/card';
import { UserRole } from '@/app/lib/auth';
import { 
  UserGroupIcon, 
  BookOpenIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  change?: string;
  positive?: boolean;
}

const StatCard = ({ title, value, icon, description, change, positive }: StatCardProps) => (
  <Card className="flex flex-col h-full">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      </div>
      <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900">
        <span className="text-blue-600 dark:text-blue-300">{icon}</span>
      </div>
    </div>
    {(description || change) && (
      <div className="mt-4 flex items-center">
        {change && (
          <span className={`inline-flex items-center text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? (
              <span className="mr-1">↑</span>
            ) : (
              <span className="mr-1">↓</span>
            )}
            {change}
          </span>
        )}
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{description}</p>}
      </div>
    )}
  </Card>
);

interface DashboardStatsProps {
  role: UserRole;
}

export default function DashboardStats({ role }: DashboardStatsProps) {
  // Different stats based on user role
  if (role === 'admin') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value="1,284"
          icon={<UserGroupIcon className="h-6 w-6" />}
          change="8%"
          positive={true}
          description="Since last month"
        />
        <StatCard
          title="Total Faculty"
          value="64"
          icon={<AcademicCapIcon className="h-6 w-6" />}
          change="3%"
          positive={true}
          description="Since last month"
        />
        <StatCard
          title="Active Courses"
          value="48"
          icon={<BookOpenIcon className="h-6 w-6" />}
          change="12%"
          positive={true}
          description="Since last semester"
        />
        <StatCard
          title="System Uptime"
          value="99.9%"
          icon={<CheckCircleIcon className="h-6 w-6" />}
          description="Last 30 days"
        />
      </div>
    );
  }

  if (role === 'faculty') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Courses"
          value="8"
          icon={<BookOpenIcon className="h-6 w-6" />}
          description="This semester"
        />
        <StatCard
          title="Enrolled Students"
          value="283"
          icon={<UserGroupIcon className="h-6 w-6" />}
          change="5%"
          positive={true}
          description="Since last semester"
        />
        <StatCard
          title="Pending Assignments"
          value="16"
          icon={<DocumentTextIcon className="h-6 w-6" />}
          description="To be graded"
        />
        <StatCard
          title="Average Grade"
          value="B+"
          icon={<AcademicCapIcon className="h-6 w-6" />}
          description="Across all courses"
        />
      </div>
    );
  }

  // Student stats by default
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Enrolled Courses"
        value="6"
        icon={<BookOpenIcon className="h-6 w-6" />}
        description="This semester"
      />
      <StatCard
        title="Upcoming Assignments"
        value="4"
        icon={<DocumentTextIcon className="h-6 w-6" />}
        description="Due this week"
      />
      <StatCard
        title="GPA"
        value="3.8"
        icon={<AcademicCapIcon className="h-6 w-6" />}
        change="0.2"
        positive={true}
        description="Since last semester"
      />
      <StatCard
        title="Upcoming Deadline"
        value="2 days"
        icon={<ClockIcon className="h-6 w-6" />}
        description="Physics Assignment"
      />
    </div>
  );
}