'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  ClockIcon,
  DocumentTextIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import apiService from '@/app/lib/utils/api';
import { useToast } from '@/app/components/ui/toast';
import Button from '@/app/components/ui/button';
import Card from '@/app/components/ui/card';
import { useSession, getSession } from 'next-auth/react';

// Types
interface Assignment {
  _id: string;
  id?: string; // Add optional id property for API compatibility
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
      gradedAt?: string;
      gradedBy?: {
        _id: string;
        name: string;
      }
    };
    status: 'pending' | 'submitted' | 'late' | 'graded';
  }>;
  isPublished: boolean;
  createdBy: any;
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const assignmentId = params.assignmentId as string;
  const { data: session } = useSession();
  const userId = session?.user?.id; // Get user ID from session
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [comment, setComment] = useState('');
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await getSession();
        console.log('Detail page - Current session:', currentSession);
        console.log('Detail page - User ID in session:', currentSession?.user?.id);
        console.log('Detail page - Access token:', currentSession?.accessToken ? 'Present (hidden for security)' : 'Missing');
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkSession();
    fetchAssignment();
  }, [assignmentId]);
  
  const fetchAssignment = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching assignment details for ID:', assignmentId);
      
      // Try to use the specific endpoint for getting a single assignment
      try {
        console.log('Attempting to fetch with getAssignmentById');
        const response = await apiService.student.getAssignmentById(assignmentId);
        console.log('getAssignmentById response:', response);
        
        if (response && response.data) {
          const assignmentData = response.data.data || response.data;
          console.log('Setting assignment data:', assignmentData);
          setAssignment(assignmentData);
          setIsLoading(false);
          return; // Exit early if successful
        }
      } catch (specificError) {
        console.log('getAssignmentById failed, falling back to list method:', specificError);
        // Continue to fallback method if specific endpoint fails
      }
      
      // Fallback: fetch all assignments and find the one we need
      console.log('Using fallback method to find assignment');
      const response = await apiService.student.getAssignments();
      console.log('API Response from getAssignments:', response);
      
      let assignmentsArray = [];
      
      // Process the response data based on its structure
      if (response && response.data) {
        console.log('Response has data property');
        
        if (Array.isArray(response.data)) {
          console.log('Data is an array');
          assignmentsArray = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Data has nested data array');
          assignmentsArray = response.data.data;
        } else if (response.data.assignments && Array.isArray(response.data.assignments)) {
          console.log('Data has assignments array');
          assignmentsArray = response.data.assignments;
        } else {
          // Look for any array in the response that might contain assignments
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            console.log('Found potential assignments array');
            assignmentsArray = possibleArrays[0];
          } else {
            throw new Error('Could not find assignments data in response');
          }
        }
      } else {
        console.error('Invalid response format:', response);
        throw new Error('No data in response');
      }
      
      console.log('Extracted assignments array:', assignmentsArray);
      console.log('Looking for assignment with ID:', assignmentId);
      
      const foundAssignment = assignmentsArray.find(
        (a: Assignment) => a._id === assignmentId || a.id === assignmentId
      );
      
      if (foundAssignment) {
        console.log('Found assignment:', foundAssignment);
        setAssignment(foundAssignment);
      } else {
        console.error('Assignment not found in data');
        showToast({
          title: 'Error',
          message: 'Assignment not found',
          type: 'error'
        });
        router.push('/student/assignments');
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching assignment:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Server error response:', error.response.data);
        console.error('Status code:', error.response.status);
        showToast({
          title: 'Server Error', 
          message: `Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`,
          type: 'error'
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
        showToast({
          title: 'Network Error',
          message: 'Server did not respond. Check your connection.',
          type: 'error'
        });
      } else {
        showToast({
          title: 'Error',
          message: error.message || 'Failed to load assignment details',
          type: 'error'
        });
      }
      
      setIsLoading(false);
      router.push('/student/assignments');
      
      // For development/testing only
      if (process.env.NODE_ENV === 'development') {
        console.log('Setting mock assignment data for development');
        setAssignment({
          _id: assignmentId,
          title: 'Mock Assignment',
          description: 'This is a mock assignment for testing purposes',
          course: { _id: '101', title: 'Test Course', code: 'TEST101' },
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalMarks: 100,
          attachments: [],
          submissions: [],
          isPublished: true,
          createdBy: 'testuser'
        });
        setIsLoading(false);
      }
    }
  };
  
  // Get submission for the current student
  const getSubmission = () => {
    if (!assignment || !userId) return null;
    
    return assignment.submissions.find(
      submission => submission.student._id === userId || submission.student === userId
    );
  };
  
  // Get submission status
  const getSubmissionStatus = () => {
    const submission = getSubmission();
    
    if (!submission) {
      return 'pending';
    }
    
    return submission.status;
  };
  
  // Check if assignment is overdue
  const isOverdue = () => {
    if (!assignment) return false;
    
    return new Date(assignment.dueDate) < new Date() && getSubmissionStatus() === 'pending';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate days remaining or overdue
  const getDaysRemaining = () => {
    if (!assignment) return 0;
    
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(e.target.files);
    }
  };
  
  // Handle assignment submission
  const handleSubmitAssignment = async () => {
    if (!assignment || !uploadFiles) {
      showToast({
        title: 'Error',
        message: 'Please select files to upload',
        type: 'error'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
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
      await apiService.student.submitAssignment(assignmentId, formData);
      
      showToast({
        title: 'Success',
        message: 'Assignment submitted successfully',
        type: 'success'
      });
      
      // Refresh assignment data
      fetchAssignment();
      
      // Close modal and reset form
      setIsUploadModalOpen(false);
      setUploadFiles(null);
      setComment('');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showToast({
        title: 'Error',
        message: 'Failed to submit assignment',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = () => {
    const status = getSubmissionStatus();
    
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'graded':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'late':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return isOverdue() ? 
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Get status text
  const getStatusText = () => {
    const status = getSubmissionStatus();
    
    if (status === 'pending' && isOverdue()) {
      return 'Overdue';
    }
    
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assignment not found</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The assignment you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link href="/student/assignments" className="mt-4 inline-block">
          <Button variant="primary">
            Go Back to Assignments
          </Button>
        </Link>
      </div>
    );
  }
  
  const submission = getSubmission();
  const status = getSubmissionStatus();
  const daysRemaining = getDaysRemaining();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/student/assignments" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{assignment.title}</h1>
      </div>
      
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Course: <span className="font-medium text-gray-900 dark:text-white">{assignment.course.title} ({assignment.course.code})</span>
              </div>
              
              <div className="flex items-center mt-2">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Due: <span className="font-medium">{formatDate(assignment.dueDate)}</span>
                  {daysRemaining > 0 && status === 'pending' && (
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining)
                    </span>
                  )}
                  {daysRemaining < 0 && status === 'pending' && (
                    <span className="ml-2 text-red-600 dark:text-red-400">
                      ({Math.abs(daysRemaining)} {Math.abs(daysRemaining) === 1 ? 'day' : 'days'} overdue)
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass()}`}>
                {getStatusText()}
              </span>
              
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Total Marks:</span> {assignment.totalMarks}
              </div>
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
            <div className="text-gray-700 dark:text-gray-300">
              <p>{assignment.description}</p>
            </div>
          </div>
          
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Assignment Materials</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {assignment.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <FolderIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.filename}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{file.mimetype}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {submission && submission.status === 'graded' && submission.grade && (
            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Graded Assignment</h3>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div className="text-green-800 dark:text-green-300">
                  <p className="text-xl font-bold">{submission.grade.marks} / {assignment.totalMarks}</p>
                  <p className="text-sm">
                    {Math.round((submission.grade.marks / assignment.totalMarks) * 100)}% Score
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0 md:text-right">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Submitted on: {new Date(submission.submissionDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Graded on: {submission.grade.gradedAt ? new Date(submission.grade.gradedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {submission.grade.feedback && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Feedback:</h4>
                  <p className="text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-3 rounded">
                    {submission.grade.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {submission && submission.attachments && submission.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your Submission</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Submitted on: {new Date(submission.submissionDate).toLocaleDateString()}
                </div>
                
                {submission.comment && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Your Comment:</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 p-3 rounded">
                      {submission.comment}
                    </p>
                  </div>
                )}
                
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Files:</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {submission.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={`${process.env.NEXT_PUBLIC_API_URL}/${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-3" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 truncate">{file.filename}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">{file.mimetype}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            {(status === 'pending' || (status === 'submitted' && new Date(assignment.dueDate) > new Date())) && (
              <Button
                variant="primary"
                icon={<ArrowUpTrayIcon className="h-5 w-5" />}
                onClick={() => setIsUploadModalOpen(true)}
              >
                {status === 'submitted' ? 'Update Submission' : 'Submit Assignment'}
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {/* Assignment Submission Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Submit Assignment
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
                  disabled={!uploadFiles || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 