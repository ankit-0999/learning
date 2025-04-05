'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  DocumentTextIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Button from '@/app/components/ui/button';
import Card from '@/app/components/ui/card';
import Input from '@/app/components/forms/input';
import Link from 'next/link';
import apiService from '@/app/lib/utils/api';

// Try to import the toast component, but use our fallback if it fails
let useToast: any;
try {
  const { useToast: importedUseToast } = require('@/app/components/ui/toast');
  useToast = importedUseToast;
} catch (e) {
  console.warn('Toast component not found, using fallback');
  const { showToast: fallbackShowToast } = require('@/app/lib/utils/toast');
  // Create a hook-like interface for our fallback
  useToast = () => ({
    showToast: fallbackShowToast
  });
}

// Assignment interface matching the backend model
interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: any;
  dueDate: string;
  totalMarks: number;
  attachments?: Array<{
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

interface Course {
  _id: string;
  title: string;
  code: string;
}

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment> | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [formFile, setFormFile] = useState<File | null>(null);
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    totalMarks: 100,
    isPublished: true
  });

  // Fetch assignments and courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching courses and assignments...');
        
        // Fetch faculty's courses
        console.log('Fetching courses...');
        const coursesResponse = await apiService.faculty.getCourses();
        console.log('Courses response:', coursesResponse);
        
        if (coursesResponse && coursesResponse.data) {
          if (Array.isArray(coursesResponse.data)) {
            console.log('Setting courses from data array');
            setCourses(coursesResponse.data);
          } else if (coursesResponse.data.data && Array.isArray(coursesResponse.data.data)) {
            console.log('Setting courses from data.data array');
            setCourses(coursesResponse.data.data);
          } else if (coursesResponse.data.courses && Array.isArray(coursesResponse.data.courses)) {
            console.log('Setting courses from data.courses array');
            setCourses(coursesResponse.data.courses);
          } else {
            console.error('Invalid courses data format:', coursesResponse.data);
            setCourses([]);
          }
        } else {
          console.error('No data in courses response');
          setCourses([]);
        }
        
        // Fetch faculty's assignments
        console.log('Fetching assignments...');
        const assignmentsResponse = await apiService.faculty.getAssignments();
        console.log('Assignments response:', assignmentsResponse);
        
        if (assignmentsResponse && assignmentsResponse.data) {
          if (Array.isArray(assignmentsResponse.data)) {
            console.log('Setting assignments from data array');
            setAssignments(assignmentsResponse.data);
          } else if (assignmentsResponse.data.data && Array.isArray(assignmentsResponse.data.data)) {
            console.log('Setting assignments from data.data array');
            setAssignments(assignmentsResponse.data.data);
          } else if (assignmentsResponse.data.assignments && Array.isArray(assignmentsResponse.data.assignments)) {
            console.log('Setting assignments from data.assignments array');
            setAssignments(assignmentsResponse.data.assignments);
          } else {
            console.error('Invalid assignments data format:', assignmentsResponse.data);
            setAssignments([]);
            showToast({
              title: 'Error',
              message: 'Received invalid assignments data format from server',
              type: 'error'
            });
          }
        } else {
          console.error('No data in assignments response');
          setAssignments([]);
          showToast({
            title: 'Error',
            message: 'Failed to retrieve assignments data',
            type: 'error'
          });
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error details:', error);
        
        if (error.response) {
          console.error('API error response:', error.response.data);
          console.error('Status code:', error.response.status);
          showToast({
            title: 'API Error',
            message: `Server returned ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`,
            type: 'error'
          });
        } else if (error.request) {
          console.error('No response received:', error.request);
          showToast({
            title: 'Network Error',
            message: 'No response from server. Check network connection and ensure server is running.',
            type: 'error'
          });
        } else {
          console.error('Error message:', error.message);
          showToast({
            title: 'Error',
            message: 'Failed to load assignments and courses',
            type: 'error'
          });
        }
        
        setIsLoading(false);
        
        // For demo/development purposes only
        setCourses([
          { _id: '1', title: 'Introduction to Web Development', code: 'CS101' },
          { _id: '2', title: 'Database Systems', code: 'CS202' },
          { _id: '3', title: 'Computer Networks', code: 'CS303' }
        ]);
      }
    };

    fetchData();
  }, []);

  const filteredAssignments = Array.isArray(assignments) 
    ? assignments.filter(assignment => 
      showDrafts ? !assignment.isPublished : assignment.isPublished
    )
    : [];

  const handleCreateAssignment = () => {
    setFormData({
      title: '',
      description: '',
      course: courses.length > 0 ? courses[0]._id : '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week from now
      totalMarks: 100,
      isPublished: true
    });
    setFormFile(null);
    setCurrentAssignment(null);
    setIsModalOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      course: assignment.course._id || assignment.course,
      dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
      totalMarks: assignment.totalMarks,
      isPublished: assignment.isPublished
    });
    setFormFile(null);
    setCurrentAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (assignmentToDelete) {
      try {
        // Call the API to delete the assignment
        await apiService.faculty.deleteAssignment(assignmentToDelete._id);
        
        // Remove it from the state
        setAssignments(assignments.filter(a => a._id !== assignmentToDelete._id));
        showToast({
          title: 'Success',
          message: 'Assignment deleted successfully',
          type: 'success'
        });
      } catch (error) {
        console.error('Error deleting assignment:', error);
        showToast({
          title: 'Error',
          message: 'Failed to delete assignment',
          type: 'error'
        });
      } finally {
        setIsDeleteModalOpen(false);
        setAssignmentToDelete(null);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title) {
      showToast({ title: 'Error', message: 'Assignment title is required', type: 'error' });
      return;
    }
    
    if (!formData.course) {
      showToast({ title: 'Error', message: 'Course selection required', type: 'error' });
      return;
    }
    
    if (!formData.dueDate) {
      showToast({ title: 'Error', message: 'Due date required', type: 'error' });
      return;
    }
    
    try {
      console.log('Submitting assignment data:', formData);
      
      let response;
      if (currentAssignment?._id) {
        // Update existing assignment
        const updateData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'attachments' && Array.isArray(value)) {
              value.forEach(file => {
                if (file instanceof File) {
                  updateData.append('attachments', file);
                }
              });
            } else {
              updateData.append(key, value as string);
            }
          }
        });
        
        // Add file if selected
        if (formFile) {
          updateData.append('attachments', formFile);
        }
        
        response = await apiService.faculty.updateAssignment(currentAssignment._id, updateData);
        showToast({
          title: 'Success',
          message: 'Assignment updated successfully',
          type: 'success'
        });
      } else {
        // Create new assignment
        const assignmentData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'attachments' && Array.isArray(value)) {
              value.forEach(file => {
                if (file instanceof File) {
                  assignmentData.append('attachments', file);
                }
              });
            } else {
              assignmentData.append(key, value as string);
            }
          }
        });
        
        // Add file if selected
        if (formFile) {
          assignmentData.append('attachments', formFile);
        }
        
        response = await apiService.faculty.createAssignment(assignmentData);
        showToast({
          title: 'Success',
          message: 'Assignment created successfully',
          type: 'success'
        });
      }
      
      // Refresh assignments list
      await refreshAssignments();
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        course: courses.length > 0 ? courses[0]._id : '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalMarks: 100,
        isPublished: true
      });
      setFormFile(null);
      setIsModalOpen(false);
      setCurrentAssignment(null);
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showToast({
        title: 'Submission Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: 'error'
      });
    }
  };

  // Helper function to refresh assignments
  const refreshAssignments = async () => {
    try {
      const refreshResponse = await apiService.faculty.getAssignments();
      console.log('Refresh response:', refreshResponse);
      
      if (refreshResponse.data && Array.isArray(refreshResponse.data)) {
        setAssignments(refreshResponse.data);
      } else if (refreshResponse.data && refreshResponse.data.assignments && Array.isArray(refreshResponse.data.assignments)) {
        setAssignments(refreshResponse.data.assignments);
      } else {
        console.warn('Unexpected response format when refreshing assignments:', refreshResponse.data);
      }
    } catch (refreshError) {
      console.error('Error refreshing assignments:', refreshError);
    }
  };

  // Helper function to format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignment Management</h1>
        <div className="flex space-x-3">
          <Button
            variant={showDrafts ? 'primary' : 'outline'}
            onClick={() => setShowDrafts(!showDrafts)}
          >
            {showDrafts ? 'View Published' : 'View Drafts'}
          </Button>
          <Button 
            variant="primary"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={handleCreateAssignment}
          >
            Create Assignment
          </Button>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No assignments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {showDrafts 
              ? "You don't have any draft assignments. Create a new assignment to get started."
              : "You don't have any published assignments. Create and publish an assignment to make it visible to students."}
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={handleCreateAssignment}
            >
              Create New Assignment
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment._id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {assignment.course.title} ({assignment.course.code})
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                        title="Edit Assignment"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment)}
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                        title="Delete Assignment"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Due: <span className="font-medium">{formatDate(assignment.dueDate)}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Status: <span className={`font-medium ${
                          assignment.isPublished ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assignment.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </span>
                    </div>
                    
                    {assignment.isPublished && (
                      <>
                        <div className="flex items-center">
                          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Submissions: <span className="font-medium">{assignment.submissions.length}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Graded: <span className="font-medium">
                              {assignment.submissions.filter(sub => sub.status === 'graded').length}/{assignment.submissions.length}
                            </span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.description}</p>
                  </div>
                  
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments:</h4>
                      <div className="flex flex-wrap gap-2">
                        {assignment.attachments.map((attachment, index) => (
                          <a 
                            key={index}
                            href={`http://localhost:5000/${attachment.path}`}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            {attachment.filename}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {assignment.isPublished && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 min-w-[200px]">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignment.totalMarks}</p>
                    </div>
                    
                    <Link 
                      href={`/faculty/assignments/${assignment._id}/submissions`}
                      className="w-full text-center text-sm px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition"
                    >
                      View Submissions
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentAssignment ? 'Edit Assignment' : 'Create Assignment'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Assignment title"
                />
              </div>
              
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                  placeholder="Detailed instructions for the assignment"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Marks
                  </label>
                  <Input
                    id="totalMarks"
                    name="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    required
                    min={1}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attachments
                </label>
                <input
                  id="attachments"
                  name="attachments"
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-400"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="isPublished"
                  name="isPublished"
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Publish immediately (visible to students)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  {currentAssignment ? 'Save Changes' : 'Create Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && assignmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delete Assignment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the assignment "{assignmentToDelete.title}"?
              {assignmentToDelete.submissions.length > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: This assignment has {assignmentToDelete.submissions.length} submissions that will also be deleted.
                </span>
              )}
            </p>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}