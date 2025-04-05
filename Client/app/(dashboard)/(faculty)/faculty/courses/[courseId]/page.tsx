'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  BookOpenIcon, 
  PlusIcon, 
  TrashIcon, 
  VideoCameraIcon,
  DocumentTextIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Card from '@/app/components/ui/card';
import Button from '@/app/components/ui/button';
import Input from '@/app/components/forms/input';
import TextArea from '@/app/components/forms/text-area';
import apiService from '@/app/lib/utils/api';
import { toast } from 'react-hot-toast';

interface Lecture {
  _id?: string;
  title: string;
  description: string;
  content: string;
  contentType: 'video' | 'document' | 'image';
  duration?: number;
  order: number;
}

interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  isPublished: boolean;
  lectures: Lecture[];
}

export default function CourseContentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [newLecture, setNewLecture] = useState<Lecture>({
    title: '',
    description: '',
    content: '',
    contentType: 'video',
    order: 0,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.faculty.getCourseById(courseId);
      if (response.data && response.data.data) {
        setCourse(response.data.data);
        // Set the new lecture order to be the next in sequence
        if (response.data.data.lectures && response.data.data.lectures.length > 0) {
          setNewLecture(prev => ({
            ...prev,
            order: response.data.data.lectures.length
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLecture(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type based on contentType
    const validTypes: Record<string, string[]> = {
      'video': ['video/mp4', 'video/webm', 'video/ogg'],
      'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'image': ['image/jpeg', 'image/png', 'image/gif']
    };

    if (!validTypes[newLecture.contentType].includes(file.type)) {
      toast.error(`Invalid file type. Please upload a ${newLecture.contentType} file.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulating upload progress - in a real app, you'd use FormData and monitor XHR progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    try {
      // In a real implementation, use apiService to upload file and get URL
      // For now, simulate a successful upload after delay
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        
        // Set the file URL (in a real app, this would be the URL returned from your API)
        const fakeUrl = `https://example.com/uploads/${file.name}`;
        setNewLecture(prev => ({
          ...prev,
          content: fakeUrl
        }));
        
        toast.success('File uploaded successfully!');
        setIsUploading(false);
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      setIsUploading(false);
    }
  };

  const handleAddLecture = async () => {
    if (!newLecture.title || !newLecture.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, this would be an actual API call
      const response = await apiService.faculty.addLecture(courseId, newLecture);
      
      // Update local state
      setCourse(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lectures: [...prev.lectures, { ...newLecture, _id: response.data.data._id }]
        };
      });
      
      // Reset form
      setNewLecture({
        title: '',
        description: '',
        content: '',
        contentType: 'video',
        order: (course?.lectures.length || 0) + 1
      });
      
      toast.success('Lecture added successfully!');
    } catch (error) {
      console.error('Error adding lecture:', error);
      toast.error('Failed to add lecture');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    
    try {
      await apiService.faculty.deleteLecture(courseId, lectureId);
      
      // Update local state
      setCourse(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lectures: prev.lectures.filter(lecture => lecture._id !== lectureId)
        };
      });
      
      toast.success('Lecture deleted successfully!');
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast.error('Failed to delete lecture');
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'document':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'image':
        return <PhotoIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading course details...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">Course not found</h3>
        <p className="mt-2 text-gray-500">The course you're looking for doesn't exist or you don't have access to it.</p>
        <Button 
          className="mt-4" 
          onClick={() => router.push('/faculty/courses')}
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{course.description}</p>
        </div>
        <Button 
          onClick={() => router.push('/faculty/courses')}
          variant="outline"
        >
          Back to Courses
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            {course.lectures && course.lectures.length > 0 ? (
              <div className="space-y-4">
                {course.lectures.map((lecture, index) => (
                  <div 
                    key={lecture._id || index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          {getContentTypeIcon(lecture.contentType)}
                        </div>
                        <div>
                          <h3 className="text-md font-medium">{lecture.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{lecture.description}</p>
                          {lecture.duration && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')} mins
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => lecture._id && handleDeleteLecture(lecture._id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No content yet</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Use the form on the right to add lectures and content to this course.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Add New Lecture</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lecture Title *
              </label>
              <Input
                name="title"
                value={newLecture.title}
                onChange={handleInputChange}
                placeholder="Enter lecture title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <TextArea
                name="description"
                value={newLecture.description}
                onChange={handleInputChange}
                placeholder="Enter a short description"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Type
              </label>
              <select
                name="contentType"
                value={newLecture.contentType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900"
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="image">Image</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content File *
              </label>
              <div className="mt-1 flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{uploadProgress}%</span>
                </div>
              )}
              
              {newLecture.content && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  {getContentTypeIcon(newLecture.contentType)}
                  <span className="ml-1">File selected: {newLecture.content.split('/').pop()}</span>
                </div>
              )}
            </div>
            
            <Button
              className="w-full mt-4"
              onClick={handleAddLecture}
              disabled={isSaving || !newLecture.title || !newLecture.content}
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Lecture
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 