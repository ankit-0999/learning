'use client';

import { useState, useEffect } from 'react';
import apiService from '../../lib/utils/api';
import Link from 'next/link';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
    code: string;
  };
  dueDate: string;
  totalPoints: number;
  submissionType: string;
  resources: {
    title: string;
    type: string;
    url: string;
  }[];
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // Depending on user role, we fetch different data
        const response = await apiService.student.getAssignments();
        setAssignments(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching assignments:', err);
        setError(err.message || 'Failed to fetch assignments');
        setLoading(false);
        
        // For demo purposes, add some mock data if API fails
        // Remove this in production
        const mockAssignments = [
          {
            _id: '1',
            title: 'Machine Learning Algorithm Implementation',
            description: 'Implement a basic linear regression algorithm from scratch and apply it to the provided dataset.',
            course: {
              _id: '1',
              title: 'Introduction to Machine Learning',
              code: 'CS301'
            },
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: 100,
            submissionType: 'file',
            resources: [
              { title: 'Linear Regression Guide', type: 'document', url: '#' },
              { title: 'Dataset for Assignment', type: 'file', url: '#' }
            ],
          },
          {
            _id: '2',
            title: 'Robot Arm Control System',
            description: 'Design and implement a control system for a 3-degree-of-freedom robot arm.',
            course: {
              _id: '2',
              title: 'Robotics Engineering',
              code: 'ENG202'
            },
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: 150,
            submissionType: 'file',
            resources: [
              { title: 'Robot Arm Specs', type: 'document', url: '#' },
              { title: 'Control System Examples', type: 'video', url: '#' }
            ],
          },
          {
            _id: '3',
            title: 'Business Model Canvas',
            description: 'Create a Business Model Canvas for your startup idea and prepare a 5-minute pitch.',
            course: {
              _id: '3',
              title: 'Entrepreneurship and Innovation',
              code: 'BUS401'
            },
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: 100,
            submissionType: 'file',
            resources: [
              { title: 'Business Model Canvas Template', type: 'document', url: '#' },
              { title: 'Example Pitches', type: 'video', url: '#' }
            ],
          }
        ];
        setAssignments(mockAssignments);
      }
    };

    fetchAssignments();
  }, []);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to check if assignment is due soon (within 3 days)
  const isDueSoon = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 3 && diffDays > 0;
  };

  // Function to check if assignment is overdue
  const isOverdue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    return dueDate < now;
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Assignments</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <p className="text-sm">Using demo data instead.</p>
        </div>
      )}
      
      <div className="space-y-6">
        {assignments.map((assignment) => (
          <div key={assignment._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{assignment.title}</h2>
                  <Link href={`/courses/${assignment.course._id}`} className="text-sm text-primary-600 hover:underline">
                    {assignment.course.title} ({assignment.course.code})
                  </Link>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium rounded-full px-3 py-1 inline-block ${
                    isOverdue(assignment.dueDate) 
                      ? 'bg-red-100 text-red-800' 
                      : isDueSoon(assignment.dueDate) 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {isOverdue(assignment.dueDate) 
                      ? 'Overdue' 
                      : isDueSoon(assignment.dueDate) 
                        ? 'Due Soon' 
                        : 'Upcoming'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Due: {formatDate(assignment.dueDate)}</p>
                  <p className="text-sm text-gray-600">Points: {assignment.totalPoints}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">{assignment.description}</p>
              
              {assignment.resources.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Resources</h3>
                  <ul className="space-y-1">
                    {assignment.resources.map((resource, index) => (
                      <li key={index}>
                        <a 
                          href={resource.url} 
                          className="text-primary-600 hover:underline flex items-center"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <span className="mr-2">
                            {resource.type === 'document' && '📄'}
                            {resource.type === 'video' && '🎬'}
                            {resource.type === 'file' && '📁'}
                          </span>
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Link href={`/assignments/${assignment._id}`} className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded transition-colors">
                View Assignment
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 