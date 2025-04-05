'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  AcademicCapIcon,
  UsersIcon,
  ClockIcon,
  BookOpenIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Button from '@/app/components/ui/button';
import Card from '@/app/components/ui/card';
import Input from '@/app/components/forms/input';
import apiService from '@/app/lib/utils/api';
import { Course, User, ApiResponse } from '@/app/lib/utils/api';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getSession } from 'next-auth/react';

// Types
type Faculty = User & {
  _id: string;
  role: 'faculty';
};

interface CourseFormData {
  title: string;
  description: string;
  instructor: string;
  category: string;
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isPublished: boolean;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Course>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for form data
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    instructor: '',
    category: 'Computer Science',
    duration: 4,
    level: 'Beginner',
    isPublished: false
  });

  // Fetch courses and faculty on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch courses
        const coursesResponse = await apiService.admin.getAllCourses();
        if (coursesResponse.data && coursesResponse.data.data) {
          setCourses(coursesResponse.data.data as Course[]);
        }
        
        // Fetch faculty members
        const facultyResponse = await apiService.admin.getFacultyMembers();
        if (facultyResponse.data && facultyResponse.data.data) {
          setFacultyList(facultyResponse.data.data as Faculty[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique categories for filter
  const categories = Array.from(new Set(courses.map(course => course.category)));
  
  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => 
      (statusFilter === 'all' || 
       (statusFilter === 'published' && course.isPublished) || 
       (statusFilter === 'draft' && !course.isPublished)) &&
      (categoryFilter === 'all' || course.category === categoryFilter) &&
      (course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       (typeof course.instructor === 'object' && course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      let fieldA: any = undefined;
      let fieldB: any = undefined;
      
      // Handle nested properties
      if (sortField === 'instructor') {
        fieldA = typeof a.instructor === 'object' ? a.instructor.name : '';
        fieldB = typeof b.instructor === 'object' ? b.instructor.name : '';
      } else {
        fieldA = a[sortField as keyof Course];
        fieldB = b[sortField as keyof Course];
      }
      
      // Compare fields - handle strings safely
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      // For numeric or boolean values - handle undefined safely
      if (fieldA === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (fieldB === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: keyof Course) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateCourse = () => {
    setCurrentCourse(null);
    setFormData({
      title: '',
      description: '',
      instructor: facultyList.length > 0 ? facultyList[0]._id : '',
      category: 'Computer Science',
      duration: 4,
      level: 'Beginner',
      isPublished: false
    });
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: typeof course.instructor === 'object' ? course.instructor._id : course.instructor,
      category: course.category,
      duration: course.duration,
      level: course.level,
      isPublished: course.isPublished
    });
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      try {
        const response = await apiService.admin.deleteCourse(courseToDelete._id);
        if (response.data && response.data.success) {
          setCourses(courses.filter(c => c._id !== courseToDelete._id));
          toast.success('Course deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      } finally {
        setIsDeleteModalOpen(false);
        setCourseToDelete(null);
      }
    }
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields client-side
      if (!formData.title?.trim()) {
        toast.error("Course title is required");
        return;
      }
      
      if (!formData.description?.trim()) {
        toast.error("Course description is required");
        return;
      }
      
      if (!formData.instructor) {
        toast.error("Instructor is required");
        return;
      }
      
      // Create a new FormData instance to properly handle the file upload
      const courseFormData = new FormData();
      
      // Add text fields to FormData
      courseFormData.append('title', formData.title);
      courseFormData.append('description', formData.description);
      courseFormData.append('instructor', formData.instructor);
      courseFormData.append('category', formData.category);
      courseFormData.append('duration', formData.duration.toString());
      courseFormData.append('level', formData.level);
      courseFormData.append('isPublished', formData.isPublished.toString());
      
      // Add thumbnail file if it exists
      const thumbnailInput = document.getElementById('thumbnail') as HTMLInputElement;
      if (thumbnailInput?.files?.[0]) {
        courseFormData.append('thumbnail', thumbnailInput.files[0]);
        console.log('Thumbnail added:', thumbnailInput.files[0].name);
      }
      
      console.log("Submitting course with these fields:");
      for (const [key, value] of courseFormData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      let response;
      if (currentCourse) {
        // Update existing course
        response = await apiService.admin.updateCourse(currentCourse._id, courseFormData);
      } else {
        // Create new course
        response = await apiService.admin.createCourse(courseFormData);
      }
      
      if (response.data && response.data.data) {
        if (currentCourse) {
          // Update courses list
          setCourses(courses.map(course => 
            course._id === currentCourse._id ? response.data.data as Course : course
          ));
          toast.success('Course updated successfully');
        } else {
          // Add to courses list
          setCourses([...courses, response.data.data as Course]);
          toast.success('Course created successfully');
        }
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('Request made but no response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // More detailed error message
      let errorMsg = 'Failed to save course';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMsg = error.response.data.errors.map((e: any) => e.message).join(', ');
      }
      
      toast.error(errorMsg);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Published
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Draft
      </span>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
        <Button 
          variant="primary" 
          onClick={handleCreateCourse} 
          icon={<PlusIcon className="h-5 w-5" />}
        >
          Create Course
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search input */}
            <div className="flex-grow relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Courses table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort('title')}
                    >
                      <div className="flex items-center">
                        Course Name
                        <ChevronUpDownIcon className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort('instructor')}
                    >
                      <div className="flex items-center">
                        Instructor
                        <ChevronUpDownIcon className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        <ChevronUpDownIcon className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredCourses.map((course) => (
                    <tr key={course._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="h-10 w-10 rounded-md mr-3 object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <BookOpenIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{course.level}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {typeof course.instructor === 'object' ? course.instructor.name : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(course.isPublished)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {course.enrolledStudents ? course.enrolledStudents.length : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(course.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {!isLoading && filteredCourses.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No courses found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Create/Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitCourse} className="p-4" encType="multipart/form-data">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    label="Course Title"
                    name="title"
                    id="title"
                    type="text"
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor</label>
                  <select
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-900 dark:text-white"
                    required
                  >
                    {facultyList.length === 0 ? (
                      <option value="">No faculty members available</option>
                    ) : (
                      facultyList.map(faculty => (
                        <option key={faculty._id} value={faculty._id}>
                          {faculty.name} ({faculty.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-900 dark:text-white"
                  placeholder="Course description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-900 dark:text-white"
                    required
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Business">Business</option>
                    <option value="Arts">Arts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="duration">Duration (weeks)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    max="52"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="level">Level</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>Publish Course (visible to students)</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  When published, students will be able to enroll and access this course.
                </p>
              </div>

              {/* Add thumbnail upload field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Thumbnail
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    id="thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:text-gray-400 dark:file:bg-gray-700 dark:file:text-gray-200"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Recommended size: 600x400 pixels (JPG, PNG)
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                >
                  {currentCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Deletion
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete the course <span className="font-medium">{courseToDelete.title}</span>? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 