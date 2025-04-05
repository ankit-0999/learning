'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClockIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Button from '@/app/components/ui/button';
import Card from '@/app/components/ui/card';

// Types
interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer?: number; // Index of correct answer (only used for checking)
}

interface Quiz {
  id: string;
  title: string;
  course: string;
  timeLimit: number; // in minutes
  questions: QuizQuestion[];
}

// Mock data
const mockQuizzes: Record<string, Quiz> = {
  '1': {
    id: '1',
    title: 'HTML Fundamentals',
    course: 'Introduction to Web Development',
    timeLimit: 30,
    questions: [
      {
        id: 1,
        text: 'Which HTML tag is used to define an unordered list?',
        options: ['<ol>', '<ul>', '<li>', '<list>'],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'Which HTML attribute is used to define inline styles?',
        options: ['class', 'style', 'font', 'styles'],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'Which HTML element is used to specify a header for a document or section?',
        options: ['<head>', '<header>', '<top>', '<h1>'],
        correctAnswer: 1,
      },
      {
        id: 4,
        text: 'What is the correct HTML for creating a hyperlink?',
        options: [
          '<a>http://example.com</a>', 
          '<a url="http://example.com">Link</a>', 
          '<a href="http://example.com">Link</a>', 
          '<link href="http://example.com">Link</link>'
        ],
        correctAnswer: 2,
      },
      {
        id: 5,
        text: 'Which HTML element is used to define the document type?',
        options: ['<doctype>', '<!DOCTYPE html>', '<doc>', '<type>'],
        correctAnswer: 1,
      },
    ],
  },
  '2': {
    id: '2',
    title: 'CSS Layouts',
    course: 'Introduction to Web Development',
    timeLimit: 45,
    questions: [
      {
        id: 1,
        text: 'Which CSS property is used to change the text color of an element?',
        options: ['text-color', 'color', 'font-color', 'text-style'],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'Which CSS property controls the text size?',
        options: ['text-size', 'font-size', 'text-style', 'font-style'],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'Which CSS property is used to create space between elements?',
        options: ['spacing', 'margin', 'padding', 'border'],
        correctAnswer: 1,
      },
      {
        id: 4,
        text: 'What does CSS stand for?',
        options: [
          'Creative Style Sheets', 
          'Computer Style Sheets', 
          'Cascading Style Sheets', 
          'Colorful Style Sheets'
        ],
        correctAnswer: 2,
      },
      {
        id: 5,
        text: 'Which property is used to change the background color?',
        options: ['color', 'bgcolor', 'background-color', 'background'],
        correctAnswer: 2,
      },
    ],
  },
};

type Props = {
  params: { quizId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function QuizPage({ params }: Props) {
  const router = useRouter();
  const { quizId } = params;
  const quiz = mockQuizzes[quizId];
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(quiz?.questions.length || 0).fill(-1));
  const [timeRemaining, setTimeRemaining] = useState(quiz?.timeLimit * 60 || 0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If quiz doesn't exist, show error
  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The quiz you're looking for doesn't exist or has been removed.
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
  
  // Format time remaining to MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };
  
  // Handle quiz submission
  const handleSubmitQuiz = () => {
    setIsSubmitting(true);
    
    // Calculate score
    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (answers[i] === quiz.questions[i].correctAnswer) {
        score++;
      }
    }
    
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    // In a real app, you would send this to your backend
    // For now, we'll just simulate a delay and redirect
    setTimeout(() => {
      router.push(`/student/quizzes/${quizId}/results?score=${percentage}`);
    }, 1500);
  };
  
  // Current question
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md">
          <ClockIcon className="h-5 w-5" />
          <span className={`font-mono font-medium ${timeRemaining < 60 ? 'text-red-600 dark:text-red-400' : ''}`}>
            {formatTimeRemaining()}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentQuestionIndex === index
                  ? 'bg-blue-600 text-white'
                  : answers[index] >= 0
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      
      <Card className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{currentQuestion.text}</p>
        </div>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`p-4 border rounded-md cursor-pointer transition-colors ${
                answers[currentQuestionIndex] === index
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                  answers[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-400'
                }`}>
                  {answers[currentQuestionIndex] === index && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            icon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            Previous
          </Button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNextQuestion}
              icon={<ArrowRightIcon className="h-5 w-5" />}
              iconPosition="right"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
} 