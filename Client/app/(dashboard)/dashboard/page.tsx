'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardStats from '@/app/components/shared/dashboard-stats';
import UsageChart from '@/app/components/shared/usage-chart';
import Card from '@/app/components/ui/card';
import Link from 'next/link';
import {
  CalendarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BellIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { UserRole } from '@/app/lib/auth';

// Mock upcoming deadlines
const upcomingDeadlines = [
  { id: 1, title: 'Web Development Assignment', course: 'Web Development', due: '2023-05-15', type: 'assignment' },
  { id: 2, title: 'Database Quiz', course: 'Database Systems', due: '2023-05-18', type: 'quiz' },
  { id: 3, title: 'Computer Networks Project', course: 'Computer Networks', due: '2023-05-25', type: 'project' },
];

// Mock announcements
const announcements = [
  { id: 1, title: 'System Maintenance', content: 'The platform will be unavailable on May 20 from 2-4 AM for scheduled maintenance.', date: '2023-05-10' },
  { id: 2, title: 'New Course Available', content: 'Introduction to Artificial Intelligence is now open for enrollment.', date: '2023-05-08' },
  { id: 3, title: 'End of Semester Reminder', content: 'Please submit all pending assignments by May 31.', date: '2023-05-05' },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole || 'student';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {userRole === 'admin' ? 'Admin Dashboard' : 
           userRole === 'faculty' ? 'Faculty Dashboard' : 'Student Dashboard'}
        </h1>
      </div>

      <DashboardStats role={userRole} />

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4">
          <UsageChart />
        </div>
        
        <div className="lg:col-span-3">
          <Card className="h-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {userRole === 'admin' ? 'Recent Announcements' : 'Upcoming Deadlines'}
            </h3>
            
            <div className="space-y-3">
              {userRole === 'admin' ? (
                // Admin sees announcements
                announcements.map((announcement) => (
                  <div key={announcement.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">{announcement.title}</h4>
                      <span className="text-xs text-gray-500">{announcement.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{announcement.content}</p>
                  </div>
                ))
              ) : (
                // Faculty and students see deadlines
                upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">{deadline.title}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-100">
                        {deadline.type}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{deadline.due}</span>
                      <span className="mx-2">•</span>
                      <span>{deadline.course}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4">
              <Link
                href={userRole === 'admin' ? '/admin/announcements' : `/${userRole}/assignments`}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View all {userRole === 'admin' ? 'announcements' : 'deadlines'} →
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {userRole === 'student' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recommended Courses
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Advanced JavaScript</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Based on your Web Development course</p>
                </div>
                <Link
                  href="/student/courses"
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Enroll
                </Link>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Data Science Fundamentals</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Popular among Computer Science students</p>
                </div>
                <Link
                  href="/student/courses"
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Enroll
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">Database Systems Quiz</span> 
                      &nbsp;was graded
                    </p>
                    <p className="text-xs text-gray-500">Yesterday at 12:30 PM</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">Prof. Johnson</span> 
                      &nbsp;replied to your question
                    </p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      New assignment posted in 
                      <span className="font-medium text-gray-900 dark:text-white"> Computer Networks</span>
                    </p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 