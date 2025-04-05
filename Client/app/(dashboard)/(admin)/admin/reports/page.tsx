'use client';

import React, { useState } from 'react';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  TableCellsIcon,
  CalendarIcon,
  AcademicCapIcon,
  UsersIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import Card from '@/app/components/ui/card';
import Button from '@/app/components/ui/button';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Types
interface ReportFilter {
  dateRange: 'week' | 'month' | 'semester' | 'year';
  department: string;
  course: string;
  reportType: 'all' | 'performance' | 'engagement' | 'completion' | 'attendance';
}

// Mock data
const departmentOptions = ['All Departments', 'Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Data Science'];
const courseOptions = ['All Courses', 'CS101', 'CS202', 'CS304', 'CS401', 'SE301', 'AI201', 'CS203'];

const performanceData = [
  { name: 'A', count: 120, percentage: 24 },
  { name: 'B', count: 180, percentage: 36 },
  { name: 'C', count: 100, percentage: 20 },
  { name: 'D', count: 60, percentage: 12 },
  { name: 'F', count: 40, percentage: 8 },
];

const engagementData = [
  { name: 'Week 1', quizzes: 85, assignments: 92, discussions: 75 },
  { name: 'Week 2', quizzes: 88, assignments: 87, discussions: 78 },
  { name: 'Week 3', quizzes: 90, assignments: 91, discussions: 82 },
  { name: 'Week 4', quizzes: 92, assignments: 89, discussions: 85 },
  { name: 'Week 5', quizzes: 91, assignments: 84, discussions: 88 },
  { name: 'Week 6', quizzes: 95, assignments: 90, discussions: 90 },
  { name: 'Week 7', quizzes: 93, assignments: 92, discussions: 92 },
  { name: 'Week 8', quizzes: 97, assignments: 94, discussions: 95 },
];

const completionData = [
  { name: 'Completed', value: 75 },
  { name: 'In Progress', value: 20 },
  { name: 'Not Started', value: 5 },
];

const COLORS = ['#4ade80', '#facc15', '#f87171'];

const attendanceData = [
  { name: 'Week 1', attendance: 95 },
  { name: 'Week 2', attendance: 92 },
  { name: 'Week 3', attendance: 88 },
  { name: 'Week 4', attendance: 90 },
  { name: 'Week 5', attendance: 86 },
  { name: 'Week 6', attendance: 92 },
  { name: 'Week 7', attendance: 89 },
  { name: 'Week 8', attendance: 91 },
];

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: 'semester',
    department: 'All Departments',
    course: 'All Courses',
    reportType: 'all',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExportReport = () => {
    // In a real app, this would generate and download a report
    alert('Report export functionality would be implemented here');
  };

  // Should show specific report based on selection or all reports
  const showReport = (type: 'performance' | 'engagement' | 'completion' | 'attendance') => {
    return filters.reportType === 'all' || filters.reportType === type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        
        <Button 
          variant="outline" 
          icon={<ArrowDownTrayIcon className="h-5 w-5" />}
          onClick={handleExportReport}
        >
          Export Report
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              id="dateRange"
              name="dateRange"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              value={filters.dateRange}
              onChange={handleFilterChange}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="semester">Current Semester</option>
              <option value="year">Current Year</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              value={filters.department}
              onChange={handleFilterChange}
            >
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course
            </label>
            <select
              id="course"
              name="course"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              value={filters.course}
              onChange={handleFilterChange}
            >
              {courseOptions.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              id="reportType"
              name="reportType"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              value={filters.reportType}
              onChange={handleFilterChange}
            >
              <option value="all">All Reports</option>
              <option value="performance">Grade Distribution</option>
              <option value="engagement">Student Engagement</option>
              <option value="completion">Course Completion</option>
              <option value="attendance">Attendance Rates</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* Grade Distribution */}
      {showReport('performance') && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Grade Distribution</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="Student Count" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="percentage" name="Percentage (%)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
            {performanceData.map((grade) => (
              <div key={grade.name} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-xl font-bold text-center text-gray-800 dark:text-white">{grade.name}</div>
                <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                  {grade.count} students ({grade.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Student Engagement */}
      {showReport('engagement') && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <UsersIcon className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Student Engagement</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={engagementData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quizzes" name="Quiz Participation (%)" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="assignments" name="Assignment Submission (%)" stroke="#82ca9d" />
                <Line type="monotone" dataKey="discussions" name="Discussion Activity (%)" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Student engagement measures active participation in course activities across the semester. High engagement rates correlate with better academic outcomes.
            </p>
          </div>
        </Card>
      )}
      
      {/* Course Completion */}
      {showReport('completion') && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <BookOpenIcon className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Course Completion Rates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Students:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">450</span>
                  </div>
                </div>
                {completionData.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                        <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Attendance Rates */}
      {showReport('attendance') && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Attendance Rates</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" name="Attendance (%)" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="font-semibold text-green-800 dark:text-green-300">Average Attendance Rate</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">91.5%</div>
              <div className="text-sm text-green-600 dark:text-green-500">Above department average by 3.2%</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="font-semibold text-blue-800 dark:text-blue-300">Lowest Attendance Week</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Week 5: 86%</div>
              <div className="text-sm text-blue-600 dark:text-blue-500">Midterm examination week</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 