'use client';

import React, { useState } from 'react';
import { 
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Card from '@/app/components/ui/card';
import Input from '@/app/components/forms/input';

// Types
interface CourseGrade {
  id: string;
  course: string;
  code: string;
  instructor: string;
  grade: string;
  percentageScore: number;
  semester: string;
  credits: number;
  status: 'completed' | 'in-progress';
}

// Mock data
const mockGrades: CourseGrade[] = [
  {
    id: '1',
    course: 'Introduction to Web Development',
    code: 'CS101',
    instructor: 'Dr. Sarah Johnson',
    grade: 'A',
    percentageScore: 92,
    semester: 'Fall 2023',
    credits: 3,
    status: 'completed',
  },
  {
    id: '2',
    course: 'Database Systems',
    code: 'CS202',
    instructor: 'Prof. Michael Chen',
    grade: 'B+',
    percentageScore: 87,
    semester: 'Fall 2023',
    credits: 4,
    status: 'completed',
  },
  {
    id: '3',
    course: 'Computer Networks',
    code: 'CS304',
    instructor: 'Dr. Robert Williams',
    grade: 'A-',
    percentageScore: 89,
    semester: 'Fall 2023',
    credits: 3,
    status: 'completed',
  },
  {
    id: '4',
    course: 'Advanced Web Development',
    code: 'CS401',
    instructor: 'Prof. James Anderson',
    grade: 'In Progress',
    percentageScore: 85,
    semester: 'Spring 2024',
    credits: 4,
    status: 'in-progress',
  },
  {
    id: '5',
    course: 'Data Structures and Algorithms',
    code: 'CS203',
    instructor: 'Dr. Emma Roberts',
    grade: 'In Progress',
    percentageScore: 78,
    semester: 'Spring 2024',
    credits: 4,
    status: 'in-progress',
  },
];

// Helper functions
const getGPA = (grades: CourseGrade[]): number => {
  const completedCourses = grades.filter(g => g.status === 'completed');
  if (completedCourses.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  completedCourses.forEach(course => {
    let gradePoints = 0;
    
    switch(course.grade) {
      case 'A': gradePoints = 4.0; break;
      case 'A-': gradePoints = 3.7; break;
      case 'B+': gradePoints = 3.3; break;
      case 'B': gradePoints = 3.0; break;
      case 'B-': gradePoints = 2.7; break;
      case 'C+': gradePoints = 2.3; break;
      case 'C': gradePoints = 2.0; break;
      case 'C-': gradePoints = 1.7; break;
      case 'D+': gradePoints = 1.3; break;
      case 'D': gradePoints = 1.0; break;
      case 'F': gradePoints = 0.0; break;
      default: gradePoints = 0.0;
    }
    
    totalPoints += gradePoints * course.credits;
    totalCredits += course.credits;
  });
  
  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
};

const getGradeColor = (grade: string): string => {
  if (grade === 'A' || grade === 'A-') {
    return 'text-green-600 dark:text-green-400';
  } else if (grade.startsWith('B') || grade === 'C+') {
    return 'text-blue-600 dark:text-blue-400';
  } else if (grade.startsWith('C') || grade === 'D+') {
    return 'text-yellow-600 dark:text-yellow-400';
  } else if (grade.startsWith('D') || grade === 'F') {
    return 'text-red-600 dark:text-red-400';
  } else {
    return 'text-gray-600 dark:text-gray-400';
  }
};

export default function StudentGradesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof CourseGrade>('course');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Get unique semesters
  const semesters = Array.from(new Set(mockGrades.map(grade => grade.semester)));
  
  // Filter and sort grades
  const filteredGrades = mockGrades
    .filter(grade => 
      (semesterFilter ? grade.semester === semesterFilter : true) &&
      (grade.course.toLowerCase().includes(searchQuery.toLowerCase()) || 
       grade.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
       grade.instructor.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' 
          ? fieldA - fieldB
          : fieldB - fieldA;
      }
      
      return 0;
    });
  
  // Toggle sort
  const toggleSort = (field: keyof CourseGrade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // GPA calculation
  const cumulativeGPA = getGPA(mockGrades);
  const semesterGPA = semesterFilter 
    ? getGPA(mockGrades.filter(g => g.semester === semesterFilter))
    : cumulativeGPA;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Record</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            type="search"
            label=""
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          
          <select
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={semesterFilter || ''}
            onChange={(e) => setSemesterFilter(e.target.value || null)}
          >
            <option value="">All Semesters</option>
            {semesters.map(semester => (
              <option key={semester} value={semester}>{semester}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cumulative GPA</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">All semesters</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-center my-4">
            {cumulativeGPA.toFixed(2)}
            <span className="text-sm text-gray-500 dark:text-gray-400"> / 4.00</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(cumulativeGPA / 4) * 100}%` }}
            />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {semesterFilter || 'Current'} GPA
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Selected semester</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-center my-4">
            {semesterGPA.toFixed(2)}
            <span className="text-sm text-gray-500 dark:text-gray-400"> / 4.00</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${(semesterGPA / 4) * 100}%` }}
            />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Credits</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Earned / In Progress</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-center my-4">
            {mockGrades.filter(g => g.status === 'completed').reduce((acc, curr) => acc + curr.credits, 0)}
            <span className="text-sm text-gray-500 dark:text-gray-400"> / 
              {mockGrades.reduce((acc, curr) => acc + curr.credits, 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">Completed</span>
            <span className="text-gray-500 dark:text-gray-400">In Progress</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-purple-600 h-2.5 rounded-full" 
              style={{ 
                width: `${(mockGrades.filter(g => g.status === 'completed').reduce((acc, curr) => acc + curr.credits, 0) / 
                         mockGrades.reduce((acc, curr) => acc + curr.credits, 0)) * 100}%` 
              }}
            />
          </div>
        </Card>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('code')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Course Code</span>
                    {sortField === 'code' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('course')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Course Name</span>
                    {sortField === 'course' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('instructor')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Instructor</span>
                    {sortField === 'instructor' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('credits')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Credits</span>
                    {sortField === 'credits' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('semester')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Semester</span>
                    {sortField === 'semester' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('percentageScore')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Grade</span>
                    {sortField === 'percentageScore' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4" /> : 
                        <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredGrades.length > 0 ? (
                filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {grade.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {grade.course}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {grade.instructor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {grade.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {grade.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold text-base ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </span>
                        {grade.status === 'completed' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {grade.percentageScore}%
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No courses found matching your search criteria.
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