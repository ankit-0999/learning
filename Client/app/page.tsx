'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/button';

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
            <span className="block">Modern <span className="text-blue-600">E-Learning</span></span>
            <span className="block">Platform</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl">
            A comprehensive learning management system for educational institutions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href="/login">
            <Button variant="primary" size="lg" fullWidth>
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" fullWidth>
              Register
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">For Students</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Access course materials, submit assignments, and track your academic progress
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">For Faculty</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create and manage courses, grade assignments, and monitor student performance
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">For Administrators</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Oversee user accounts, manage system settings, and generate reports
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
