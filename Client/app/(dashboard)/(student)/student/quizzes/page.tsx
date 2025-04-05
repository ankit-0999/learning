'use client';

import React, { useState } from 'react';
import { 
  ClockIcon, 
  DocumentTextIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Button from '@/app/components/ui/button';
import Card from '@/app/components/ui/card';
import Input from '@/app/components/forms/input';

// Types
interface Quiz {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  timeLimit: number; // in minutes
  questions: number;
  status: 'available' | 'upcoming' | 'completed';
  score?: number;
}

// Mock data
const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'HTML Fundamentals',
    course: 'Introduction to Web Development',
    dueDate: '2023-06-10',
    timeLimit: 30,
    questions: 20,
    status: 'available',
  },
  {
    id: '2',
    title: 'CSS Layouts',
    course: 'Introduction to Web Development',
    dueDate: '2023-06-15',
    timeLimit: 45,
    questions: 25,
    status: 'available',
  },
  {
    id: '3',
    title: 'JavaScript Basics',
    course: 'Introduction to Web Development',
    dueDate: '2023-06-25',
    timeLimit: 60,
    questions: 30,
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Database Normalization',
    course: 'Database Systems',
    dueDate: '2023-06-20',
    timeLimit: 45,
    questions: 15,
    status: 'upcoming',
  },
  {
    id: '5',
    title: 'Introduction to Networks',
    course: 'Computer Networks',
    dueDate: '2023-05-15',
    timeLimit: 30,
    questions: 20,
    status: 'completed',
    score: 85,
  },
  {
    id: '6',
    title: 'SQL Queries',
    course: 'Database Systems',
    dueDate: '2023-05-20',
    timeLimit: 60,
    questions: 25,
    status: 'completed',
    score: 92,
  },
];

export default function StudentQuizzesPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'upcoming' | 'completed'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter quizzes based on active tab and search query
  const filteredQuizzes = mockQuizzes.filter(quiz => 
    quiz.status === activeTab && 
    (quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     quiz.course.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to render tab content
  const renderTabContent = () => {
    if (filteredQuizzes.length === 0) {
      return (
        <Card className="p-10 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No quizzes found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'available' && 'You don\'t have any available quizzes at the moment.'}
            {activeTab === 'upcoming' && 'You don\'t have any upcoming quizzes scheduled.'}
            {activeTab === 'completed' && 'You haven\'t completed any quizzes yet.'}
          </p>
        </Card>
      );
    }

    return (
      <div className="grid gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.course}</p>
                </div>
                {activeTab === 'completed' && (
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Score: </span>
                    <span className={`text-sm font-bold ml-1 ${
                      (quiz.score || 0) >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {quiz.score}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Time Limit: <span className="font-medium">{quiz.timeLimit} minutes</span>
                  </span>
                </div>
                
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Questions: <span className="font-medium">{quiz.questions}</span>
                  </span>
                </div>
                
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {activeTab === 'upcoming' ? (
                      <>Due in <span className="font-medium">{getDaysRemaining(quiz.dueDate)} days</span></>
                    ) : (
                      <>Due: <span className="font-medium">{formatDate(quiz.dueDate)}</span></>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                {activeTab === 'available' && (
                  <Link href={`/student/quizzes/${quiz.id}`}>
                    <Button variant="primary" icon={<ArrowRightIcon className="h-5 w-5" />}>
                      Start Quiz
                    </Button>
                  </Link>
                )}
                
                {activeTab === 'upcoming' && (
                  <Button variant="outline" disabled>
                    Not Available Yet
                  </Button>
                )}
                
                {activeTab === 'completed' && (
                  <div className="flex space-x-3">
                    <Link href={`/student/quizzes/${quiz.id}/results`}>
                      <Button variant="outline" icon={<ChartBarIcon className="h-5 w-5" />}>
                        View Results
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
        
        <Input
          type="search"
          label=""
          placeholder="Search quizzes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('available')}
          >
            Available
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
} 