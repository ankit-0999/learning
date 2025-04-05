'use client';

import { useState, useEffect } from 'react';
import apiService from '../../lib/utils/api';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  department: string;
  instructor: {
    _id: string;
    name: string;
  };
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  credits: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Depending on user role, we fetch different data
        // This is a simplified version that will work once connected to the backend
        const response = await apiService.student.getCourses();
        setCourses(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to fetch courses');
        setLoading(false);
        
        // For demo purposes, add some mock data if API fails
        // Remove this in production
        const mockCourses = [
          {
            _id: '1',
            title: 'Introduction to Machine Learning',
            code: 'CS301',
            description: 'This course provides an introduction to the field of machine learning, focusing on fundamental algorithms and their applications.',
            department: 'Computer Science',
            instructor: {
              _id: '101',
              name: 'Dr. Sarah Johnson'
            },
            schedule: {
              days: ['Monday', 'Wednesday'],
              startTime: '10:00 AM',
              endTime: '11:30 AM',
            },
            credits: 4
          },
          {
            _id: '2',
            title: 'Robotics Engineering',
            code: 'ENG202',
            description: 'An in-depth course on robotics engineering principles, covering mechanical design, electronics, and programming for robotics applications.',
            department: 'Engineering',
            instructor: {
              _id: '102',
              name: 'Prof. Michael Chen'
            },
            schedule: {
              days: ['Tuesday', 'Thursday'],
              startTime: '2:00 PM',
              endTime: '3:30 PM',
            },
            credits: 4
          },
          {
            _id: '3',
            title: 'Entrepreneurship and Innovation',
            code: 'BUS401',
            description: 'Learn about entrepreneurship principles, business model innovation, and startup strategies in this hands-on course.',
            department: 'Business',
            instructor: {
              _id: '103',
              name: 'Dr. Emily Rodriguez'
            },
            schedule: {
              days: ['Monday', 'Friday'],
              startTime: '1:00 PM',
              endTime: '2:30 PM',
            },
            credits: 3
          }
        ];
        setCourses(mockCourses);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Courses</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <p className="text-sm">Using demo data instead.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary-600 text-white p-4">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-sm opacity-90">{course.code}</p>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500">Instructor</h3>
                <p>{course.instructor.name}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500">Schedule</h3>
                <p>{course.schedule.days.join(', ')}</p>
                <p>{course.schedule.startTime} - {course.schedule.endTime}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500">Department</h3>
                <p>{course.department}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500">Credits</h3>
                <p>{course.credits}</p>
              </div>
              
              <Link href={`/courses/${course._id}`} className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded transition-colors">
                View Course
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 