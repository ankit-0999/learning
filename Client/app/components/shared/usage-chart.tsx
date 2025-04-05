'use client';

import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';
import Card from '@/app/components/ui/card';

// Mock data
const lastMonthData = [
  { name: 'Week 1', Students: 400, Faculty: 240 },
  { name: 'Week 2', Students: 420, Faculty: 250 },
  { name: 'Week 3', Students: 520, Faculty: 265 },
  { name: 'Week 4', Students: 480, Faculty: 255 },
];

const lastSemesterData = [
  { name: 'Jan', Students: 400, Faculty: 240, Courses: 24 },
  { name: 'Feb', Students: 420, Faculty: 250, Courses: 26 },
  { name: 'Mar', Students: 520, Faculty: 265, Courses: 28 },
  { name: 'Apr', Students: 580, Faculty: 275, Courses: 30 },
  { name: 'May', Students: 620, Faculty: 285, Courses: 32 },
  { name: 'Jun', Students: 540, Faculty: 255, Courses: 30 },
];

const subjectEngagementData = [
  { name: 'Computer Science', value: 85 },
  { name: 'Mathematics', value: 72 },
  { name: 'Physics', value: 68 },
  { name: 'Chemistry', value: 60 },
  { name: 'Biology', value: 65 },
  { name: 'History', value: 45 },
  { name: 'Literature', value: 40 },
];

interface UsageChartProps {
  title?: string;
  type?: 'area' | 'bar';
  height?: number;
  showSubjectEngagement?: boolean;
}

export default function UsageChart({ 
  title = 'Platform Usage', 
  type = 'area',
  height = 400,
  showSubjectEngagement = false
}: UsageChartProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'semester'>('month');
  const data = timeRange === 'month' ? lastMonthData : lastSemesterData;

  return (
    <Card className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        {!showSubjectEngagement && (
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setTimeRange('semester')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'semester' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Last Semester
            </button>
          </div>
        )}
      </div>

      <div className="h-[calc(100%-3rem)]" style={{ minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {showSubjectEngagement ? (
            <BarChart
              data={subjectEngagementData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`${value}%`, 'Engagement']} />
              <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          ) : type === 'area' ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFaculty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCourses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Students" stroke="#3B82F6" fillOpacity={1} fill="url(#colorStudents)" />
              <Area type="monotone" dataKey="Faculty" stroke="#10B981" fillOpacity={1} fill="url(#colorFaculty)" />
              {timeRange === 'semester' && (
                <Area type="monotone" dataKey="Courses" stroke="#F59E0B" fillOpacity={1} fill="url(#colorCourses)" />
              )}
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Students" fill="#3B82F6" />
              <Bar dataKey="Faculty" fill="#10B981" />
              {timeRange === 'semester' && (
                <Bar dataKey="Courses" fill="#F59E0B" />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 