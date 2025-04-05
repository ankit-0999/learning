'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  BookOpenIcon, 
  VideoCameraIcon,
  DocumentTextIcon,
  PhotoIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ClockIcon,
  UserIcon,
  ArrowUpRightIcon as ExternalLinkIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  PlayIcon,
  MagnifyingGlassIcon as SearchIcon
} from '@heroicons/react/24/outline';
import Card from '@/app/components/ui/card';
import Button from '@/app/components/ui/button';
import apiService from '@/app/lib/utils/api';
import { toast } from 'react-hot-toast';
import { Lecture, Course } from '@/app/lib/utils/api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BookIcon, LaptopIcon, FileTextIcon, ImageIcon, FileIcon, VideoIcon } from '@/app/components/ui/icons';

export default function StudentCourseViewPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { data: session, status } = useSession();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [lectureProgress, setLectureProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCourseDetails();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
    // Test browser storage capabilities
    testBrowserStorage();
  }, [courseId, status]);

  // Function to test browser storage capabilities
  const testBrowserStorage = () => {
    try {
      // Test localStorage
      localStorage.setItem('storage-test', 'test');
      const testValue = localStorage.getItem('storage-test');
      console.log('LocalStorage test:', testValue === 'test' ? 'PASSED' : 'FAILED');
      localStorage.removeItem('storage-test');
      
      // Test cookies
      document.cookie = 'cookieTest=test; path=/';
      console.log('Cookie test:', document.cookie.includes('cookieTest=test') ? 'PASSED' : 'FAILED');
    } catch (error) {
      console.error('Browser storage test failed:', error);
    }
  };

  const fetchCourseDetails = async () => {
    setIsLoading(true);
    try {
      console.log('Attempting to fetch course with ID:', courseId);
      
      // Get auth session status first
      const sessionStatus = status;
      console.log('Authentication status:', sessionStatus);
      
      // Try authenticated endpoint first
      if (sessionStatus === 'authenticated' && session?.accessToken) {
        console.log('Access token present, attempting authenticated request');
        
        try {
          console.log('Calling student API endpoint /api/student/courses/' + courseId);
          const response = await apiService.student.getCourseById(courseId);
          console.log('Authenticated API Response status:', response.status);
          
          if (response.data && response.data.success) {
            console.log('Successfully retrieved course data with enrollment info');
            processCourseData(response.data.data, true);
            return; // Successfully fetched with authentication
          } else {
            console.log('Response successful but invalid data format:', response.data);
          }
        } catch (authError) {
          console.error('Error with authenticated request:', authError);
          console.log('Falling back to public API...');
        }
      }
      
      // Fallback to public API
      console.log('Using public API endpoint /api/courses/' + courseId);
      const publicResponse = await apiService.courses.getCourseById(courseId);
      console.log('Public API Response status:', publicResponse.status);
      
      if (publicResponse.data && publicResponse.data.success) {
        console.log('Successfully retrieved course data from public API');
        processCourseData(publicResponse.data.data, false);
      } else {
        console.log('Invalid API response structure:', publicResponse);
        toast.error('Invalid course data received');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to process course data
  const processCourseData = (courseData: any, isAuthenticated: boolean) => {
    console.log('Processing course data:', courseData);
    
    // Process lectures to ensure they have contentType and handle content correctly
    if (courseData.lectures && courseData.lectures.length > 0) {
      console.log(`Found ${courseData.lectures.length} lectures before processing`);
      
      courseData.lectures = courseData.lectures.map((lecture: any) => {
        // Handle raw content field if it's a valid URL (sometimes content could be stored as URL)
        if (lecture.content && typeof lecture.content === 'string') {
          // Check if content is actually a URL to a video, pdf, or image
          const urlPattern = /^(https?:\/\/|\/\/)/i;
          if (urlPattern.test(lecture.content)) {
            console.log(`Lecture '${lecture.title}' has content that appears to be a URL:`, lecture.content.substring(0, 50));
            
            // Try to determine content type from URL extension
            if (lecture.content.match(/\.(mp4|webm|ogg|mov)$/i)) {
              lecture.videoUrl = lecture.content;
              lecture.contentType = 'video';
              console.log(`Detected video URL in content field for '${lecture.title}'`);
            } else if (lecture.content.match(/\.(pdf|doc|docx)$/i)) {
              lecture.pdfUrl = lecture.content;
              lecture.contentType = 'document';
              console.log(`Detected document URL in content field for '${lecture.title}'`);
            } else if (lecture.content.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              lecture.contentType = 'image';
              console.log(`Detected image URL in content field for '${lecture.title}'`);
            } else if (lecture.content.includes('youtube.com') || lecture.content.includes('youtu.be')) {
              // Handle YouTube URLs
              lecture.videoUrl = lecture.content;
              lecture.contentType = 'video';
              console.log(`Detected YouTube URL in content field for '${lecture.title}'`);
            } else if (lecture.content.includes('vimeo.com')) {
              // Handle Vimeo URLs
              lecture.videoUrl = lecture.content;
              lecture.contentType = 'video';
              console.log(`Detected Vimeo URL in content field for '${lecture.title}'`);
            }
          } else if (lecture.content.trim().startsWith('<iframe') && 
                    (lecture.content.includes('youtube.com') || 
                     lecture.content.includes('vimeo.com'))) {
            // Handle embedded video iframes
            lecture.contentType = 'text'; // We'll render this as HTML
            console.log(`Detected video embed HTML in content field for '${lecture.title}'`);
          } else if (lecture.content.startsWith('<')) {
            // This appears to be HTML content
            lecture.contentType = 'text';
            console.log(`Detected HTML content for '${lecture.title}'`);
          }
        }
        
        // If contentType is still missing, determine it based on available fields
        if (!lecture.contentType) {
          if (lecture.videoUrl) {
            lecture.contentType = 'video';
            console.log(`Assigned contentType 'video' to lecture '${lecture.title}' based on videoUrl`);
          } else if (lecture.pdfUrl) {
            lecture.contentType = 'document';
            console.log(`Assigned contentType 'document' to lecture '${lecture.title}' based on pdfUrl`);
          } else if (lecture.content) {
            // Default to text for any content that doesn't have a clear type
            lecture.contentType = 'text';
            console.log(`Assigned default contentType 'text' to lecture '${lecture.title}'`);
          } else {
            // No content at all
            lecture.contentType = 'text';
            console.log(`No content found for lecture '${lecture.title}', assigned default contentType 'text'`);
          }
        }
        
        return lecture;
      });
      
      console.log(`Processed ${courseData.lectures.length} lectures with content types:`, 
        courseData.lectures.map((l: any) => ({ title: l.title, contentType: l.contentType })));
    }
    
    setCourse(courseData);
    
    // Check if the user is enrolled in this course
    const isEnrolled = courseData.isEnrolled;
    console.log('Enrollment status:', isEnrolled);
    
    // Check if lectures are available
    if (courseData.lectures && courseData.lectures.length > 0) {
      console.log(`Found ${courseData.lectures.length} lectures:`, courseData.lectures);
      
      // Debug lecture content
      courseData.lectures.forEach((lecture: any, index: number) => {
        console.log(`Lecture ${index + 1} - ${lecture.title}:`, {
          id: lecture._id,
          contentType: lecture.contentType,
          hasContent: !!lecture.content,
          contentSample: lecture.content ? lecture.content.substring(0, 30) + '...' : 'none',
          hasVideoUrl: !!lecture.videoUrl,
          hasPdfUrl: !!lecture.pdfUrl,
        });
      });
      
      // Set first lecture as selected by default if available
      setSelectedLecture(courseData.lectures[0]);
    } else {
      console.log('No lectures found in course or lecture content restricted');
      setSelectedLecture(null);
    }
    
    // Get lecture progress from local storage to persist between sessions
    if (isAuthenticated) {
      const savedProgress = localStorage.getItem(`course-${courseId}-progress`);
      if (savedProgress) {
        console.log('Found saved progress:', savedProgress);
        setLectureProgress(JSON.parse(savedProgress));
      } else {
        console.log('No saved progress found');
        // Initialize empty progress object
        setLectureProgress({});
      }
    } else {
      console.log('Not authenticated - progress tracking disabled');
      setLectureProgress({});
    }
  };

  const handleSelectLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
  };

  const markLectureAsCompleted = (lectureId: string) => {
    const updatedProgress = {
      ...lectureProgress,
      [lectureId]: true
    };
    setLectureProgress(updatedProgress);
    
    // Save progress to local storage
    localStorage.setItem(`course-${courseId}-progress`, JSON.stringify(updatedProgress));
    
    toast.success('Lecture marked as completed!');
  };

  const getLectureProgress = () => {
    if (!course || !course.lectures || course.lectures.length === 0) return 0;
    
    const completedCount = Object.values(lectureProgress).filter(Boolean).length;
    return Math.round((completedCount / course.lectures.length) * 100);
  };

  const getContentTypeIcon = (contentType?: string) => {
    switch (contentType?.toLowerCase()) {
      case 'video':
        return <VideoIcon className="h-3.5 w-3.5 text-red-500" />;
      case 'document':
        return <FileTextIcon className="h-3.5 w-3.5 text-blue-500" />;
      case 'image':
        return <ImageIcon className="h-3.5 w-3.5 text-green-500" />;
      case 'quiz':
        return <BookIcon className="h-3.5 w-3.5 text-purple-500" />;
      case 'code':
        return <LaptopIcon className="h-3.5 w-3.5 text-gray-500" />;
      default:
        return <FileIcon className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const RawContentViewer = ({ content }: { content: string }) => {
    const [viewMode, setViewMode] = useState('auto');
    
    // Check if content is a URL
    const isUrl = typeof content === 'string' && (
      content.startsWith('http://') || 
      content.startsWith('https://') || 
      content.startsWith('//')
    );
    
    // Check if content is HTML
    const isHtml = typeof content === 'string' && content.trim().startsWith('<') && content.includes('</');
    
    // Check if content is JSON
    const isJson = typeof content === 'string' && (
      (content.trim().startsWith('{') && content.trim().endsWith('}')) ||
      (content.trim().startsWith('[') && content.trim().endsWith(']'))
    );
    
    const renderContent = () => {
      // Override with selected view mode
      if (viewMode === 'url' && isUrl) {
        return (
          <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-gray-50 dark:bg-gray-800/50 shadow-sm">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <ExternalLinkIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">External Content</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
              This content is hosted externally. You can visit the link or try opening it as a specific content type.
            </p>
            <a 
              href={content} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center mb-6 font-medium"
            >
              {content.length > 50 ? content.substring(0, 50) + '...' : content}
              <ExternalLinkIcon className="ml-1 h-4 w-4" />
            </a>
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setViewMode('video')} className="flex items-center">
                <VideoCameraIcon className="h-4 w-4 mr-2 text-red-500" />
                Try as Video
              </Button>
              <Button size="sm" variant="outline" onClick={() => setViewMode('document')} className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-500" />
                Try as Document
              </Button>
              <Button size="sm" variant="outline" onClick={() => setViewMode('image')} className="flex items-center">
                <PhotoIcon className="h-4 w-4 mr-2 text-green-500" />
                Try as Image
              </Button>
            </div>
          </div>
        );
      }
      
      if (viewMode === 'video' || (viewMode === 'auto' && isUrl && /\.(mp4|webm|ogg|mov)$/i.test(content))) {
        return (
          <div className="space-y-4">
            <div className="aspect-video rounded-md overflow-hidden bg-black">
              <video 
                src={content} 
                controls 
                className="w-full h-full"
              />
            </div>
            {viewMode !== 'auto' && (
              <Button size="sm" variant="outline" onClick={() => setViewMode('auto')} className="mt-4">
                Back to Auto-Detect
              </Button>
            )}
          </div>
        );
      }
      
      if (viewMode === 'document' || (viewMode === 'auto' && isUrl && /\.(pdf|doc|docx)$/i.test(content))) {
        return (
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-md overflow-hidden border dark:border-gray-700">
              <iframe 
                src={content} 
                className="w-full h-full" 
                title="Document Viewer"
              />
            </div>
            {viewMode !== 'auto' && (
              <Button size="sm" variant="outline" onClick={() => setViewMode('auto')} className="mt-4">
                Back to Auto-Detect
              </Button>
            )}
          </div>
        );
      }
      
      if (viewMode === 'image' || (viewMode === 'auto' && isUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(content))) {
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={content} 
                alt="Content Image" 
                className="max-w-full rounded-md shadow-md max-h-[500px] object-contain"
              />
            </div>
            {viewMode !== 'auto' && (
              <Button size="sm" variant="outline" onClick={() => setViewMode('auto')} className="mt-4">
                Back to Auto-Detect
              </Button>
            )}
          </div>
        );
      }
      
      if (viewMode === 'html' || (viewMode === 'auto' && isHtml)) {
        return (
          <div className="space-y-4">
            <div 
              dangerouslySetInnerHTML={{ __html: content }} 
              className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-auto border dark:border-gray-700"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setViewMode('text')} className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View HTML Source
              </Button>
              {viewMode !== 'auto' && (
                <Button size="sm" variant="outline" onClick={() => setViewMode('auto')}>
                  Back to Auto-Detect
                </Button>
              )}
            </div>
          </div>
        );
      }
      
      if (viewMode === 'json' || (viewMode === 'auto' && isJson)) {
        try {
          const parsedJson = JSON.parse(content);
          return (
            <div className="space-y-4">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto border dark:border-gray-700 text-sm font-mono">
                {JSON.stringify(parsedJson, null, 2)}
              </pre>
              {viewMode !== 'auto' && (
                <Button size="sm" variant="outline" onClick={() => setViewMode('auto')}>
                  Back to Auto-Detect
                </Button>
              )}
            </div>
          );
        } catch (error) {
          // If JSON parsing fails, fall through to text
        }
      }
      
      // Default to text view
      return (
        <div className="space-y-4">
          {isUrl && viewMode === 'auto' && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">External Content Detected</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 break-all">{content}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <a 
                  href={content} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Open Link <ExternalLinkIcon className="ml-1 h-3 w-3" />
                </a>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setViewMode('url')}>
                  More Options
                </Button>
              </div>
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words text-sm">
              {content}
            </pre>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isHtml && viewMode === 'auto' && (
              <Button size="sm" variant="outline" onClick={() => setViewMode('html')} className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-purple-500" />
                Render as HTML
              </Button>
            )}
            
            {isJson && viewMode === 'auto' && (
              <Button size="sm" variant="outline" onClick={() => setViewMode('json')} className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2 text-indigo-500" />
                Format as JSON
              </Button>
            )}
            
            {isUrl && viewMode === 'auto' && (
              <Button size="sm" variant="outline" onClick={() => setViewMode('url')} className="flex items-center">
                <ExternalLinkIcon className="h-4 w-4 mr-2 text-blue-500" />
                View URL Options
              </Button>
            )}
          </div>
        </div>
      );
    };
    
    return (
      <div className="raw-content-viewer w-full">
        {renderContent()}
      </div>
    );
  };

  const renderContent = () => {
    if (!selectedLecture) return null;
    
    console.log('Rendering lecture content:', selectedLecture);
    
    // If contentType is undefined, determine it based on available fields
    const contentType = selectedLecture.contentType || 
      (selectedLecture.videoUrl ? 'video' : 
       selectedLecture.pdfUrl ? 'document' : 
       selectedLecture.content?.startsWith('<') ? 'text' : 'text');
    
    switch (contentType) {
      case 'video':
        return (
          <div className="h-full w-full overflow-hidden flex items-center justify-center">
            <div className="w-full max-w-full max-h-[calc(100vh-350px)] overflow-hidden flex items-center justify-center">
              {selectedLecture.videoUrl ? (
                selectedLecture.videoUrl.includes('youtube.com') || selectedLecture.videoUrl.includes('youtu.be') ? (
                  // Handle YouTube URLs by converting them to embed URLs
                  <iframe
                    src={selectedLecture.videoUrl.replace(/watch\?v=/, 'embed/').replace(/youtu\.be\//, 'youtube.com/embed/')}
                    className="w-full h-full aspect-video max-h-[500px]"
                    title={selectedLecture.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedLecture.videoUrl.includes('vimeo.com') ? (
                  // Handle Vimeo URLs
                  <iframe
                    src={selectedLecture.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full aspect-video max-h-[500px]"
                    title={selectedLecture.title}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Regular video file
                  <video 
                    src={selectedLecture.videoUrl} 
                    controls 
                    className="w-full h-auto max-h-[500px]"
                    poster={course?.thumbnail}
                  />
                )
              ) : selectedLecture.content && selectedLecture.content.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video 
                  src={selectedLecture.content} 
                  controls 
                  className="w-full h-auto max-h-[500px]"
                  poster={course?.thumbnail}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-800 text-white rounded-lg w-full max-w-md">
                  <p className="mb-4">Video content not available.</p>
                  {selectedLecture.content && (
                    <div className="w-full">
                      <p className="text-sm mb-2 text-yellow-300">Content detected but not in video format:</p>
                      <div className="bg-gray-900 p-3 rounded text-xs overflow-auto max-h-32">
                        {selectedLecture.content.substring(0, 150)}...
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          // Force content type to text to display the raw content
                          setSelectedLecture({
                            ...selectedLecture,
                            contentType: 'text'
                          });
                        }}
                      >
                        View as Text Instead
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'document':
        return (
          <div className="h-full w-full overflow-auto">
            <div className="h-[calc(100vh-350px)] w-full bg-gray-100 dark:bg-gray-800 rounded-lg">
              {selectedLecture.pdfUrl ? (
                <iframe 
                  src={selectedLecture.pdfUrl} 
                  className="w-full h-full border-0 rounded-lg" 
                  title={selectedLecture.title}
                />
              ) : selectedLecture.content && (selectedLecture.content.match(/\.(pdf|doc|docx)$/i) || /^(https?:\/\/|\/\/)/i.test(selectedLecture.content)) ? (
                <iframe 
                  src={selectedLecture.content} 
                  className="w-full h-full border-0 rounded-lg" 
                  title={selectedLecture.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-300">Document content not available</p>
                  {selectedLecture.content && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setSelectedLecture({
                          ...selectedLecture,
                          contentType: 'text'
                        });
                      }}
                    >
                      View as Text
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'image':
        return (
          <div className="h-full w-full overflow-auto">
            <div className="flex items-center justify-center h-[calc(100vh-350px)] w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden p-4">
              {selectedLecture.content && (selectedLecture.content.match(/\.(jpg|jpeg|png|gif|webp)$/i) || /^(https?:\/\/|\/\/)/i.test(selectedLecture.content)) ? (
                <img 
                  src={selectedLecture.content} 
                  alt={selectedLecture.title} 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <PhotoIcon className="h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-300">Image content not available</p>
                  {selectedLecture.content && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setSelectedLecture({
                          ...selectedLecture,
                          contentType: 'text'
                        });
                      }}
                    >
                      View as Text
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
      default:
        return (
          <div className="h-full w-full overflow-auto">
            <div className="h-[calc(100vh-350px)] overflow-auto bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="prose dark:prose-invert max-w-none">
                {selectedLecture.content ? (
                  <RawContentViewer content={selectedLecture.content} />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedLecture.description || 'No content available'}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
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
        <div className="mt-2 text-sm text-red-500">
          Debug info: Course ID = {courseId}, Authentication status = {status}
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          <Button 
            onClick={() => {
              // Force refresh the data
              fetchCourseDetails();
            }}
          >
            Retry Loading
          </Button>
          <Button 
            onClick={() => router.push('/student/courses')}
          >
            Back to Courses
          </Button>
          {status !== 'authenticated' && (
            <Button 
              onClick={() => router.push('/login')}
              variant="primary"
            >
              Log In
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 md:p-8 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold truncate max-w-md">{course.title}</h1>
            
            <div className="flex flex-wrap gap-4 items-center text-sm md:text-base">
              <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <UserIcon className="h-4 w-4 mr-2" />
                <span>{typeof course.instructor === 'object' ? course.instructor.name : course.instructor}</span>
              </div>
              <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <ClockIcon className="h-4 w-4 mr-2" />
                <span>{course.duration ? formatDuration(course.duration) : 'No duration'}</span>
              </div>
              <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                <span>{course.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="flex-grow flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
        {/* Left Sidebar - Lecture List */}
        <div className="lg:w-1/3 xl:w-1/4 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] lg:h-[calc(100vh-136px)] overflow-hidden flex flex-col bg-white dark:bg-gray-900 shadow-md">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading lectures...</p>
            </div>
          ) : course.lectures && course.lectures.length > 0 ? (
            <LectureList 
              lectures={course.lectures} 
              selectedLecture={selectedLecture} 
              onSelectLecture={handleSelectLecture}
              courseDuration={course.duration}
              progressDetails={lectureProgress}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center">
              <BookOpenIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No Lectures Available</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                This course doesn't have any lectures yet. Check back later for content updates.
              </p>
            </div>
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow p-4 lg:p-8 overflow-y-auto h-[calc(100vh-200px)] lg:h-[calc(100vh-136px)] bg-white dark:bg-gray-900">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading course content...</p>
            </div>
          ) : selectedLecture ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="pb-6 mb-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
                    {getContentTypeIcon(selectedLecture.contentType)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{selectedLecture.title}</h2>
                    {selectedLecture.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-300 overflow-auto max-h-40 custom-scrollbar">{selectedLecture.description}</p>
                    )}
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{selectedLecture.duration ? formatDuration(selectedLecture.duration) : 'No duration set'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lecture Content */}
              <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
                {renderContent()}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 pt-4">
                {course.lectures && selectedLecture._id && (
                  <>
                    {course.lectures.findIndex(l => l._id === selectedLecture._id) > 0 && (
                      <Button variant="outline" size="sm" onClick={() => handleSelectLecture(course.lectures[course.lectures.findIndex(l => l._id === selectedLecture._id) - 1])} className="group relative overflow-hidden transition-all duration-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400">
                        <span className="absolute inset-0 w-0 bg-blue-50 dark:bg-blue-900/20 transition-all duration-300 group-hover:w-full"></span>
                        <span className="relative flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous Lecture
                        </span>
                      </Button>
                    )}
                    {course.lectures.findIndex(l => l._id === selectedLecture._id) < course.lectures.length - 1 && (
                      <Button variant="outline" size="sm" onClick={() => handleSelectLecture(course.lectures[course.lectures.findIndex(l => l._id === selectedLecture._id) + 1])} className="group relative overflow-hidden transition-all duration-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400">
                        <span className="absolute inset-0 w-0 bg-blue-50 dark:bg-blue-900/20 transition-all duration-300 group-hover:w-full"></span>
                        <span className="relative flex items-center">
                          Next Lecture
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm">
              <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-8">
                <BookOpenIcon className="h-16 w-16 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-4">Select a Lecture</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg">
                Please select a lecture from the list to begin learning.
              </p>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 w-40 text-center"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LectureListProps {
  lectures: Lecture[];
  selectedLecture: Lecture | null;
  onSelectLecture: (lecture: Lecture) => void;
  courseDuration?: number;
  progressDetails?: {
    completedLectures?: string[];
    watchedDuration?: number;
  } | Record<string, boolean> | null;
}

function LectureList({ lectures = [], selectedLecture, onSelectLecture, courseDuration, progressDetails }: LectureListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredLectures = lectures?.filter(lecture => 
    lecture?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Helper function to safely access completedLectures
  const getCompletedLectures = () => {
    if (!progressDetails) return [];
    
    // Check if progressDetails has completedLectures property
    if ('completedLectures' in progressDetails && Array.isArray(progressDetails.completedLectures)) {
      return progressDetails.completedLectures || [];
    }
    
    return [];
  };
  
  // Helper function to safely get watched duration
  const getWatchedDuration = () => {
    if (!progressDetails) return 0;
    
    // Check if progressDetails has watchedDuration property
    if ('watchedDuration' in progressDetails && typeof progressDetails.watchedDuration === 'number') {
      return progressDetails.watchedDuration;
    }
    
    return 0;
  };

  // Helper function to check if a lecture is completed
  const isLectureCompleted = (lectureId: string) => {
    if (!progressDetails) return false;
    
    // Check if progressDetails has completedLectures property
    if ('completedLectures' in progressDetails && Array.isArray(progressDetails.completedLectures)) {
      return progressDetails.completedLectures.includes(lectureId);
    }
    
    return false;
  };
  
  // Function to determine the content type icon
  const getContentTypeIcon = (contentType?: string) => {
    switch(contentType?.toLowerCase()) {
      case 'video':
        return <VideoIcon className="h-3.5 w-3.5 text-red-500" />;
      case 'document':
        return <FileTextIcon className="h-3.5 w-3.5 text-blue-500" />;
      case 'image':
        return <ImageIcon className="h-3.5 w-3.5 text-green-500" />;
      case 'quiz':
        return <BookIcon className="h-3.5 w-3.5 text-purple-500" />;
      case 'code':
        return <LaptopIcon className="h-3.5 w-3.5 text-gray-500" />;
      default:
        return <FileIcon className="h-3.5 w-3.5 text-gray-400" />;
    }
  };
  
  // Scroll to selected lecture
  useEffect(() => {
    if (scrollRef.current && selectedLecture) {
      const selectedElement = document.getElementById(`lecture-${selectedLecture._id}`);
      if (selectedElement) {
        scrollRef.current.scrollTop = selectedElement.offsetTop - 100;
      }
    }
  }, [selectedLecture]);
  
  // Get the completed lectures count safely
  const completedLecturesCount = getCompletedLectures().length;
  const totalLectures = lectures.length || 1; // prevent division by zero
  const progressPercentage = Math.round((completedLecturesCount / totalLectures) * 100) || 0;
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search lectures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {courseDuration && progressDetails && (
          <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Course Progress</h4>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {completedLecturesCount} of {totalLectures} completed
              </span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>{formatDuration(getWatchedDuration())} watched</span>
              <span>{formatDuration(courseDuration)} total</span>
            </div>
          </div>
        )}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-4 custom-scrollbar"
      >
        {!filteredLectures?.length ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <SearchIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">{searchTerm ? "No lectures match your search" : "No lectures available"}</p>
            {searchTerm && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearchTerm("")}
                className="mt-2"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredLectures.map((lecture, index) => {
              // Determine if lecture is completed
              const isCompleted = isLectureCompleted(lecture._id || '');
              const isActive = selectedLecture?._id === lecture._id;
              
              return (
                <div 
                  key={lecture._id} 
                  id={`lecture-${lecture._id}`}
                  onClick={() => onSelectLecture(lecture)}
                  className={cn(
                    "flex flex-col p-3 rounded-md cursor-pointer group transition-all duration-200",
                    {
                      "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400": isActive,
                      "hover:bg-gray-100 dark:hover:bg-gray-800/70 border-l-4 border-transparent": !isActive
                    }
                  )}
                >
                  <div className="flex items-start">
                    <div className="flex items-center justify-center h-6 w-6 flex-shrink-0 mr-3">
                      {isCompleted ? (
                        <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                      ) : isActive ? (
                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <PlayIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "text-sm font-medium leading-5 break-words",
                        isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      )}>
                        {lecture.title}
                      </h4>
                      <div className="flex items-center mt-1">
                        {getContentTypeIcon(lecture.contentType)}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
                          {lecture.duration ? formatDuration(lecture.duration) : "No duration"}
                        </span>
                      
                      </div>
                
                    </div>
                  </div>
                  {lecture.description && (
                    <div className={cn(
                      "mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 transition-all duration-200",
                      isActive ? "line-clamp-none" : "line-clamp-1 group-hover:line-clamp-2"
                    )}>
                      {lecture.description} 
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 