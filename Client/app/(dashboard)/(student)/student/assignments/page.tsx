'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  FolderIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Button from '@/app/components/ui/button';
import Card from '@/app/components/ui/card';
import Input from '@/app/components/forms/input';
import apiService from '@/app/lib/utils/api';
import { useToast } from '@/app/components/ui/toast';
import { useSession, getSession } from 'next-auth/react';

// Types
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
  totalMarks: number;
  attachments: Array<{
    filename: string;
    path: string;
    mimetype: string;
  }>;
  submissions: Array<{
    student: any;
    submissionDate: string;
    attachments: Array<{
      filename: string;
      path: string;
      mimetype: string;
    }>;
    comment?: string;
    grade?: {
      marks: number;
      feedback?: string;
    };
    status: 'pending' | 'submitted' | 'late' | 'graded';
  }>;
  isPublished: boolean;
  createdBy: any;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [comment, setComment] = useState('');
  const { showToast } = useToast();
  const { data: session } = useSession();
  const userId = session?.user?.id; // Get user ID from session
  
  // Fetch assignments on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await getSession();
        console.log('Current session:', currentSession);
        console.log('User ID in session:', currentSession?.user?.id);
        console.log('Access token in session:', currentSession?.accessToken ? 'Present (hidden for security)' : 'Missing');
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkSession();
    fetchAssignments();
  }, []);
  
  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching student assignments...');
      const response = await apiService.student.getAssignments();
      console.log('Student assignments API response:', response);
      
      // Check if response has data property
      if (response && response.data) {
        console.log('Response has data property:', response.data);
        
        // Case 1: data is an array
        if (Array.isArray(response.data)) {
          console.log('Data is an array, setting assignments directly');
          setAssignments(response.data);
        } 
        // Case 2: data.data is an array (nested data structure)
        else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Data.data is an array, using that');
          setAssignments(response.data.data);
        }
        // Case 3: data contains assignments array
        else if (response.data.assignments && Array.isArray(response.data.assignments)) {
          console.log('Data has assignments array property');
          setAssignments(response.data.assignments);
        }
        // Case 4: Unknown format but we can access response.data directly
        else if (typeof response.data === 'object') {
          console.log('Unknown data format, attempting to use response.data directly');
          // Try to extract anything that looks like assignments
          const possibleAssignments = Object.values(response.data).find(val => Array.isArray(val));
          if (possibleAssignments) {
            console.log('Found array in response.data, using it');
            setAssignments(possibleAssignments as Assignment[]);
          } else {
            console.error('Could not find assignments array in:', response.data);
            setAssignments([]);
            showToast({
              title: 'Data Format Error',
              message: 'Failed to parse assignments data from server response',
              type: 'error'
            });
          }
        } else {
          console.error('Invalid assignments data format:', response.data);
          setAssignments([]);
          showToast({
            title: 'Error',
            message: 'Received invalid data format from server',
            type: 'error'
          });
        }
      } else {
        console.error('No data in API response:', response);
        setAssignments([]);
        showToast({
          title: 'Error',
          message: 'No data received from server',
          type: 'error'
        });
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Server error response:', error.response.data);
        console.error('Status code:', error.response.status);
        showToast({
          title: 'Server Error',
          message: `Server returned error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`,
          type: 'error'
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
        showToast({
          title: 'Network Error',
          message: 'No response from server. Check your connection and ensure the server is running.',
          type: 'error'
        });
      } else {
        showToast({
          title: 'Error',
          message: error.message || 'Failed to load assignments',
          type: 'error'
        });
      }
      
      setIsLoading(false);
      setAssignments([]); // Set to empty array to prevent filter errors
      
      // Add mock data for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding mock assignments for development');
        setAssignments([
          {
            _id: '1',
            title: 'Mock Assignment 1',
            description: 'This is a mock assignment for testing',
            course: { _id: '101', title: 'Test Course', code: 'TEST101' },
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalMarks: 100,
            attachments: [],
            submissions: [],
            isPublished: true,
            createdBy: 'testuser'
          }
        ]);
      }
    }
  };
  
  // Get submission status for the current student
  const getSubmissionStatus = (assignment: Assignment) => {
    if (!userId) return 'pending';
    
    const submission = assignment.submissions.find(
      submission => submission.student._id === userId || submission.student === userId
    );
    
    if (!submission) {
      return 'pending';
    }
    
    return submission.status;
  };
  
  // Check if an assignment is overdue
  const isOverdue = (assignment: Assignment) => {
    return new Date(assignment.dueDate) < new Date() && getSubmissionStatus(assignment) === 'pending';
  };
  
  // Filter assignments based on search query and status filter
  const filteredAssignments = Array.isArray(assignments) 
    ? assignments.filter(assignment => {
        const status = getSubmissionStatus(assignment);
        
        return (
          (statusFilter === 'all' || status === statusFilter) &&
          (assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          assignment.course.title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
    : [];
  
  // Sort by due date (closest first)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(e.target.files);
    }
  };
  
  // Handle assignment submission
  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !uploadFiles) {
      showToast({
        title: 'Error',
        message: 'Please select files to upload',
        type: 'error'
      });
      return;
    }
    
    try {
      const formData = new FormData();
      
      // Append files
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append('attachments', uploadFiles[i]);
      }
      
      // Add comment if provided
      if (comment.trim()) {
        formData.append('comment', comment);
      }
      
      // Submit the assignment
      await apiService.student.submitAssignment(selectedAssignment._id, formData);
      
      showToast({
        title: 'Success',
        message: 'Assignment submitted successfully',
        type: 'success'
      });
      
      // Refresh assignments
      fetchAssignments();
      
      // Close modal and reset form
      setIsUploadModalOpen(false);
      setUploadFiles(null);
      setSelectedAssignment(null);
      setComment('');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showToast({
        title: 'Error',
        message: 'Failed to submit assignment',
        type: 'error'
      });
    }
  };
  
  const openSubmitModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsUploadModalOpen(true);
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'graded':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'late':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Get status text
  const getStatusText = (assignment: Assignment) => {
    const status = getSubmissionStatus(assignment);
    
    if (status === 'pending' && isOverdue(assignment)) {
      return 'Overdue';
    }
    
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Get submission for the current student
  const getSubmission = (assignment: Assignment) => {
    if (!userId) return null;
    
    return assignment.submissions.find(
      submission => submission.student._id === userId || submission.student === userId
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            type="search"
            label=""
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>
      
      {assignments.length === 0 ? (
        <Card className="p-8 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don&apos;t have any assignments yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAssignments.map((assignment) => {
            const status = getSubmissionStatus(assignment);
            const daysRemaining = getDaysRemaining(assignment.dueDate);
            const submission = getSubmission(assignment);
            
            return (
              <Card key={assignment._id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {assignment.course.title} ({assignment.course.code})
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end mt-4 md:mt-0">
                      <span 
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(
                          isOverdue(assignment) ? 'late' : status
                        )}`}
                      >
                        {getStatusText(assignment)}
                      </span>
                      
                      <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>
                          Due: {formatDate(assignment.dueDate)}
                          {daysRemaining > 0 && status === 'pending' && (
                            <span className="ml-1 text-gray-600 dark:text-gray-300">
                              ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p>{assignment.description}</p>
                    </div>
                  </div>
                  
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assignment Files:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {assignment.attachments.map((file, index) => (
                          <a
                            key={index}
                            href={`${process.env.NEXT_PUBLIC_API_URL}/${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          >
                            <FolderIcon className="h-4 w-4 mr-2" />
                            {file.filename}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {submission && submission.status === 'graded' && submission.grade && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-400">
                          Feedback:
                        </h4>
                        <span className="text-sm font-bold text-green-800 dark:text-green-400">
                          Grade: {submission.grade.marks}/{assignment.totalMarks} ({Math.round((submission.grade.marks / assignment.totalMarks) * 100)}%)
                        </span>
                      </div>
                      {submission.grade.feedback && (
                        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                          {submission.grade.feedback}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {submission && submission.attachments && submission.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Submission:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {submission.attachments.map((file, index) => (
                          <a
                            key={index}
                            href={`${process.env.NEXT_PUBLIC_API_URL}/${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-900/60"
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-2" />
                            {file.filename}
                          </a>
                        ))}
                      </div>
                      {submission.comment && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Comment:</span> {submission.comment}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    {(status === 'pending' || (status === 'submitted' && new Date(assignment.dueDate) > new Date())) && (
                      <Button
                        variant="primary"
                        icon={<ArrowUpTrayIcon className="h-5 w-5" />}
                        onClick={() => openSubmitModal(assignment)}
                      >
                        {status === 'submitted' ? 'Update Submission' : 'Submit Assignment'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Assignment Submission Modal */}
      {isUploadModalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Submit Assignment: {selectedAssignment.title}
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Files
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Allowed file types: .pdf, .doc, .docx, .jpg, .png, .zip
                </p>
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Add any comments about your submission"
                ></textarea>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitAssignment}
                  disabled={!uploadFiles}
                >
                  Submit Assignment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 