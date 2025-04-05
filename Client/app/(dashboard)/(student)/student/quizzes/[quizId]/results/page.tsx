'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Button from '@/app/components/ui/button';
import Card from '@/app/components/ui/card';
import Link from 'next/link';

type Props = {
  params: { quizId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function QuizResultsPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { quizId } = params;
  const score = searchParams.get('score') ? parseInt(searchParams.get('score') || '0') : 0;
  
  // Mock feedback based on score
  const getFeedback = () => {
    if (score >= 90) {
      return 'Excellent! You have a strong understanding of the material.';
    } else if (score >= 70) {
      return 'Good job! You have grasped most of the concepts.';
    } else if (score >= 50) {
      return 'You have a basic understanding but need to review some concepts.';
    } else {
      return 'You need to review the material and retake the quiz for better understanding.';
    }
  };
  
  // Mock quiz data
  const quizDetails = {
    '1': {
      title: 'HTML Fundamentals',
      course: 'Introduction to Web Development',
      questions: 5,
    },
    '2': {
      title: 'CSS Layouts',
      course: 'Introduction to Web Development',
      questions: 5,
    },
  };
  
  const quiz = quizDetails[quizId as keyof typeof quizDetails];
  
  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The quiz results you're looking for don't exist or have been removed.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push('/student/quizzes')}
          >
            Back to Quizzes
          </Button>
        </Card>
      </div>
    );
  }
  
  // Calculate correct answers
  const correctAnswers = Math.round((score / 100) * quiz.questions);
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Results</h1>
        <Link href="/student/quizzes">
          <Button variant="outline" icon={<ArrowLeftIcon className="h-5 w-5" />}>
            Back to Quizzes
          </Button>
        </Link>
      </div>
      
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{quiz.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{quiz.course}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-4xl font-bold text-center">
              <span className={
                score >= 70 ? 'text-green-600 dark:text-green-400' : 
                score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-red-600 dark:text-red-400'
              }>
                {score}%
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              Overall Score
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{correctAnswers}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              Correct Answers
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quiz.questions - correctAnswers}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              Incorrect Answers
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Feedback</h3>
          <p className="text-gray-700 dark:text-gray-300">{getFeedback()}</p>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance Breakdown</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{score}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${score}%` }}></div>
              </div>
            </div>
            
            {/* Mock breakdown by categories - In a real app, this would be dynamic */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Basic Concepts</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.min(100, score + 10)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, score + 10)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Topics</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.max(0, score - 15)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.max(0, score - 15)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recommended Resources</h3>
          </div>
          
          <ul className="space-y-3">
            <li className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <a 
                href="#" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Complete guide to {quiz.title}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review the fundamentals with this comprehensive guide.
              </p>
            </li>
            <li className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <a 
                href="#" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Practice exercises for {quiz.course}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Hands-on practice to strengthen your skills.
              </p>
            </li>
            <li>
              <a 
                href="#" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Video tutorials on difficult concepts
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Visual explanations to help clarify complex topics.
              </p>
            </li>
          </ul>
          
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Resources
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 