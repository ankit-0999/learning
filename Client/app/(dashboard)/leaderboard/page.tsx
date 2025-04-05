'use client';

import React, { useState } from 'react';
import { 
  TrophyIcon,
  CheckBadgeIcon,
  FireIcon,
  StarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import Card from '@/app/components/ui/card';
import Button from '@/app/components/ui/button';
import Input from '@/app/components/forms/input';

// Types
interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'faculty';
  department: string;
  achievementPoints: number;
  perfectScores: number;
  coursesCompleted: number;
  streak: number;
  badges: string[];
  rank?: number;
}

// Mock data
const mockUsers: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Computer Science',
    achievementPoints: 1250,
    perfectScores: 8,
    coursesCompleted: 12,
    streak: 45,
    badges: ['Problem Solver', 'Fast Learner', 'Course Master'],
  },
  {
    id: '2',
    name: 'Samantha Chen',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Data Science',
    achievementPoints: 1420,
    perfectScores: 10,
    coursesCompleted: 14,
    streak: 60,
    badges: ['Quiz Master', 'Perfect Attendance', 'Curriculum Expert', 'Top Contributor'],
  },
  {
    id: '3',
    name: 'David Rodriguez',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Computer Science',
    achievementPoints: 1150,
    perfectScores: 7,
    coursesCompleted: 11,
    streak: 30,
    badges: ['Reliable Student', 'Teamwork Expert'],
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Software Engineering',
    achievementPoints: 980,
    perfectScores: 6,
    coursesCompleted: 9,
    streak: 21,
    badges: ['Coding Expert', 'Quick Thinker'],
  },
  {
    id: '5',
    name: 'Michael Zhang',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Computer Science',
    achievementPoints: 1380,
    perfectScores: 9,
    coursesCompleted: 13,
    streak: 52,
    badges: ['Homework Hero', 'Fast Learner', 'Participation Star', 'Course Master'],
  },
  {
    id: '6',
    name: 'Olivia Davis',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Web Development',
    achievementPoints: 1050,
    perfectScores: 5,
    coursesCompleted: 10,
    streak: 28,
    badges: ['UI Expert', 'Team Leader'],
  },
  {
    id: '7',
    name: 'James Anderson',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Mobile Development',
    achievementPoints: 920,
    perfectScores: 4,
    coursesCompleted: 8,
    streak: 18,
    badges: ['App Master', 'Task Completer'],
  },
  {
    id: '8',
    name: 'Sophia Kim',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Cybersecurity',
    achievementPoints: 1100,
    perfectScores: 7,
    coursesCompleted: 10,
    streak: 32,
    badges: ['Security Expert', 'Bug Hunter'],
  },
  {
    id: '9',
    name: 'Ethan Patel',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'AI & Machine Learning',
    achievementPoints: 1320,
    perfectScores: 9,
    coursesCompleted: 12,
    streak: 48,
    badges: ['AI Expert', 'Model Builder', 'Data Scientist'],
  },
  {
    id: '10',
    name: 'Isabella Martinez',
    avatar: '/avatars/default.svg',
    role: 'student',
    department: 'Game Development',
    achievementPoints: 990,
    perfectScores: 6,
    coursesCompleted: 9,
    streak: 25,
    badges: ['Game Designer', 'Animation Expert'],
  },
];

// Add ranks to users
const addRanks = (users: LeaderboardUser[], sortField: keyof LeaderboardUser): LeaderboardUser[] => {
  return [...users]
    .sort((a, b) => {
      if (typeof a[sortField] === 'number' && typeof b[sortField] === 'number') {
        return (b[sortField] as number) - (a[sortField] as number);
      }
      return 0;
    })
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
};

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<keyof LeaderboardUser>('achievementPoints');
  const [timeFrame, setTimeFrame] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  
  // Filter users based on search query
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Add ranks and sort by current category
  const rankedUsers = addRanks(filteredUsers, currentCategory);
  
  // Get top 3 users
  const topUsers = rankedUsers.slice(0, 3);
  
  // Get remaining users
  const remainingUsers = rankedUsers.slice(3);
  
  // Category titles and descriptions
  const categories = {
    achievementPoints: {
      title: 'Achievement Points',
      description: 'Based on overall participation and achievements',
      icon: <TrophyIcon className="h-6 w-6 text-yellow-500" />,
    },
    perfectScores: {
      title: 'Perfect Scores',
      description: 'Number of 100% quiz and assignment scores',
      icon: <StarIcon className="h-6 w-6 text-purple-500" />,
    },
    coursesCompleted: {
      title: 'Courses Completed',
      description: 'Total number of courses successfully finished',
      icon: <CheckBadgeIcon className="h-6 w-6 text-green-500" />,
    },
    streak: {
      title: 'Learning Streak',
      description: 'Consecutive days of learning activity',
      icon: <FireIcon className="h-6 w-6 text-orange-500" />,
    },
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Celebrating our top performers across the platform
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            type="search"
            label=""
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          
          <select
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as any)}
          >
            <option value="all-time">All Time</option>
            <option value="monthly">This Month</option>
            <option value="weekly">This Week</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(categories).map(([key, category]) => (
          <Card 
            key={key} 
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
              currentCategory === key ? 'border-2 border-blue-500 dark:border-blue-400' : ''
            }`}
            onClick={() => setCurrentCategory(key as keyof LeaderboardUser)}
          >
            <div className="flex items-center">
              <div className="mr-3">
                {category.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{category.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-4 my-8">
        {topUsers.map((user, index) => {
          const position = [1, 0, 2][index]; // Center the 1st place
          const heights = ['h-40', 'h-56', 'h-32'];
          const marginTop = ['', '-mt-16', ''];
          
          return (
            <div key={user.id} className={`relative ${marginTop[index]} flex-1 flex flex-col items-center`}>
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-xl font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  position === 0 ? 'bg-yellow-500' : position === 1 ? 'bg-gray-400' : 'bg-amber-700'
                }`}>
                  {position + 1}
                </div>
              </div>
              
              <div className="text-center mt-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.department}</p>
                <div className="mt-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {user[currentCategory] as number}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {categories[currentCategory as keyof typeof categories].title}
                  </span>
                </div>
              </div>
              
              <div className={`w-full ${heights[position]} mt-4 rounded-t-lg bg-gradient-to-b ${
                position === 0 ? 'from-yellow-300 to-yellow-500' : 
                position === 1 ? 'from-gray-300 to-gray-500' : 
                'from-amber-500 to-amber-700'
              }`}></div>
            </div>
          );
        })}
      </div>
      
      {/* Rest of the Leaderboard */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {categories[currentCategory as keyof typeof categories].title}
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Badges
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {remainingUsers.length > 0 ? (
                remainingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{user.rank}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-xl font-bold">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{user.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user[currentCategory] as number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-1">
                        {user.badges.slice(0, 3).map((badge, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            title={badge}
                          >
                            {badge.split(' ')[0]}
                          </span>
                        ))}
                        {user.badges.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            +{user.badges.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                        onClick={() => window.open(`/profile/${user.id}`, '_blank')}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No students found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 