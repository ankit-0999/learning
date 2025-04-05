'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  ClockIcon, 
  UserIcon, 
  StarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowRightIcon,
  PlusIcon,
  CheckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Card from '@/app/components/ui/card';
import Button from '@/app/components/ui/button';
import Link from 'next/link';
import apiService from '@/app/lib/utils/api';
import { Course as CourseType } from '@/app/lib/utils/api';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

// Define interface for displayed courses (slight modification from API Course type)
interface DisplayCourse extends Omit<CourseType, 'instructor'> {
  instructor: string | { _id: string; name: string; email: string };
  enrolled: boolean;
}

// Format duration in seconds to MM:SS format
function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [showOnlyEnrolled, setShowOnlyEnrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<DisplayCourse | null>(null);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [levels] = useState(['All', 'Beginner', 'Intermediate', 'Advanced']);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [sortOption, setSortOption] = useState('title');

  // Fetch all courses and enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        console.log('Attempting to fetch courses from backend...');
        // First try to get student-specific course data (includes enrollment info)
        try {
          const allCoursesResponse = await apiService.student.getCourses();
          console.log('Student courses API response:', allCoursesResponse);
          
          if (allCoursesResponse.data && allCoursesResponse.data.success) {
            console.log('Successfully fetched student courses with enrollment info');
            handleCoursesResponse(allCoursesResponse);
            return; // Successfully fetched courses with authentication
          }
        } catch (authError) {
          console.error('Error fetching authenticated courses:', authError);
          console.log('Falling back to public API...');
        }
        
        // Fallback to public API if student API fails
        console.log('Fetching from public API endpoint...');
        const publicCoursesResponse = await apiService.courses.getPublishedCourses();
        console.log('Public courses API response:', publicCoursesResponse);
        
        if (!publicCoursesResponse.data || !publicCoursesResponse.data.success) {
          throw new Error(publicCoursesResponse.data?.message || 'Failed to fetch courses');
        }
        
        console.log('Successfully fetched public courses');
        handleCoursesResponse(publicCoursesResponse);
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        toast.error(error.message || 'Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    const handleCoursesResponse = (response: any) => {
      let displayCourses: DisplayCourse[] = [];
      let userEnrolledCourses: string[] = [];
      
      // Try to get enrollment information from profile
      const fetchEnrollmentInfo = async () => {
        try {
          const profileResponse = await apiService.student.getProfile();
          console.log('Student profile API response:', profileResponse);
          
          if (profileResponse.data && profileResponse.data.success && profileResponse.data.data) {
            userEnrolledCourses = profileResponse.data.data.enrolledCourses?.map((course: any) => 
              typeof course === 'object' ? course._id : course
            ) || [];
            console.log('User enrolled courses:', userEnrolledCourses);
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error('Could not fetch enrolled courses. Showing all available courses.');
        }
        
        processCoursesData();
      };
      
      const processCoursesData = () => {
        if (response.data && response.data.data) {
          const allCoursesData = response.data.data;
          console.log('Raw courses data from API:', allCoursesData);
          
          if (!Array.isArray(allCoursesData)) {
            console.error('Expected courses data to be an array, but got:', allCoursesData);
            toast.error('Invalid course data format received');
            return;
          }
          
          if (allCoursesData.length === 0) {
            console.log('No courses returned from the API');
            setCourses([]);
            return;
          }
          
          console.log('Processing', allCoursesData.length, 'courses for display');
          
          // Map courses and mark as enrolled if user is enrolled
          displayCourses = allCoursesData.map((course: any) => {
            // Add safe checks for course data
            if (!course || typeof course !== 'object') {
              console.warn('Invalid course data:', course);
              return null;
            }
            
            const isEnrolled = userEnrolledCourses.some((id: string) => id === course._id);
            console.log(`Course: ${course.title}, Enrolled: ${isEnrolled}`);
            return {
              ...course,
              enrolled: isEnrolled,
              // Ensure these properties exist to prevent rendering errors
              title: course.title || 'Untitled Course',
              description: course.description || 'No description available',
              level: course.level || 'Beginner',
              category: course.category || 'Uncategorized',
              duration: course.duration || 0,
            };
          }).filter(Boolean); // Remove any null entries
          
          console.log('Final processed courses:', displayCourses);
          setCourses(displayCourses);
          
          // Extract unique categories for the filter
          const uniqueCategories = ['All', ...new Set(displayCourses.map(course => course.category))];
          console.log('Available categories:', uniqueCategories);
          setCategories(uniqueCategories);
        } else {
          console.error('Invalid API response structure:', response.data);
          toast.error('Invalid course data received');
        }
      };
      
      fetchEnrollmentInfo();
    };

    fetchCourses();
  }, []);

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    // Add safety check for course data
    if (!course || !course.title || !course.description) return false;
    
    // Handle potential null/undefined instructor
    const instructorName = course.instructor 
      ? (typeof course.instructor === 'object' 
          ? (course.instructor.name || 'Unknown Instructor') 
          : String(course.instructor))
      : 'Unknown Instructor';
    
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    const matchesEnrollment = !showOnlyEnrolled || course.enrolled;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesEnrollment;
  });

  console.log('Courses after filtering:', {
    total: courses.length,
    filtered: filteredCourses.length,
    filters: {
      search: searchTerm,
      category: selectedCategory,
      level: selectedLevel,
      onlyEnrolled: showOnlyEnrolled
    }
  });

  const handleEnrollClick = (course: DisplayCourse) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleConfirmEnroll = async () => {
    if (selectedCourse) {
      try {
        // Call enrollment API
        await apiService.student.enrollCourse(selectedCourse._id);
        
        // Update local state
        setCourses(courses.map(course => 
          course._id === selectedCourse._id ? { ...course, enrolled: true } : course
        ));
        
        toast.success('Successfully enrolled in the course');
      } catch (error) {
        console.error('Error enrolling in course:', error);
        toast.error('Failed to enroll in course');
      } finally {
        setIsModalOpen(false);
        setSelectedCourse(null);
      }
    }
  };

  // Generate star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setShowOnlyEnrolled(false);
  };

  return (
    <div className="space-y-6 w-full max-w-full pb-40 custom-scrollbar">
      {/* Header section with title and filter button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10 bg-white dark:bg-gray-950 pt-2 pb-4 w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          <BookOpenIcon className="h-7 w-7 mr-3 text-blue-500" />
          <span>Available Courses</span>
        </h1>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300" 
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          {isFiltersVisible ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Search and filters card */}
      {/* <Card className="p-6 shadow-md border-0 sticky top-[4.5rem] z-[5] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm w-full rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search courses by title or instructor" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md"
            />
          </div>
          
          <div className="flex gap-4 flex-wrap sm:flex-nowrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px] transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md"
            >
              <option value="">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Data Science">Data Science</option>
              <option value="Web Development">Web Development</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
            </select>
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px] transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            
            <Button 
              onClick={resetFilters}
              variant="outline"
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium text-blue-600 dark:text-blue-400">{filteredCourses.length}</span> of {courses.length} courses
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-8 text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="title">Title (A-Z)</option>
              <option value="titleDesc">Title (Z-A)</option>
              <option value="level">Level</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
      </Card> 

      {/* Course listings */}
      <div className="relative min-h-[300px] w-full overflow-visible mb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-md w-full">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-6"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">Loading available courses...</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">This may take a moment</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-md w-full">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon className="h-12 w-12 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Courses Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
              We couldn't find any courses available right now. Please check back later or contact your administrator for assistance.
            </p>
            <div className="w-40 mx-auto border-t border-gray-200 dark:border-gray-700 pt-6">
              <Button variant="outline" className="mx-auto hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="flex flex-wrap gap-8 w-full pb-32 px-1 sm:px-0">
            {filteredCourses.map((course) => (
              <div 
                key={course._id} 
                className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 group w-full sm:w-[calc(50%-16px)] xl:w-[calc(33.33%-22px)] mb-16 course-card"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                  {course.thumbnail ? (
                    <Image 
                      src={course.thumbnail} 
                      alt={course.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out rounded-t-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-xl">
                      <BookOpenIcon className="h-20 w-20 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md z-10">
                    {course.category}
                  </div>
                </div>
                
                <div className="p-4 sm:p-5 flex flex-col min-h-[230px]">
                  <div className="flex items-center mb-2 flex-wrap gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {course.level}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {course.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 break-words pr-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
                    {typeof course.instructor === 'object' && course.instructor ? course.instructor.name : String(course.instructor || 'Unknown Instructor')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 pr-1">{course.description}</p>
                  
                  <div className="mt-auto flex flex-wrap gap-2 items-center justify-between text-sm pt-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-blue-500 mr-1.5" />
                      <span className="text-gray-600 dark:text-gray-300 font-medium">{formatDuration(course.duration || 0)}</span>
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-blue-500 mr-1.5" />
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {course.enrolledStudents ? course.enrolledStudents.length : 0} students
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 sm:px-5 py-4 bg-gray-50 dark:bg-gray-800/50 w-full rounded-b-xl border-t border-gray-100 dark:border-gray-800">
                  {course.enrolled ? (
                    <Link href={`/student/courses/${course._id}`} className="block w-full">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-full transition-all duration-200 hover:shadow-md hover:bg-blue-600 whitespace-nowrap"
                      >
                        <span className="flex items-center justify-center">
                          Go to Course
                          <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                        </span>
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
                      onClick={() => handleEnrollClick(course)}
                    >
                      <span className="flex items-center justify-center">
                        Enroll Now 
                        <PlusIcon className="h-4 w-4 ml-2" />
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-md w-full">
            <div className="bg-amber-100 dark:bg-amber-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="h-10 w-10 text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Matching Courses</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
              We couldn't find any courses matching your filters. Try adjusting your search criteria or clearing the filters.
            </p>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="mx-auto hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Additional Card */}
      <div className="w-full max-w-4xl mx-auto mb-32">
        <div className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-600 relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[url('/images/pattern.svg')] bg-repeat"></div>
            <div className="relative z-10 text-center">
              <StarIconSolid className="h-16 w-16 text-white/90 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Join Premium Membership</h2>
            </div>
          </div>
          
          <div className="p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Unlock Advanced Learning Features</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get access to exclusive content, personalized learning paths, and expert mentorship to accelerate your learning journey.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Unlimited course access</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Downloadable resources</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Certificate of completion</span>
              </div>
            </div>
            
            <Button
              variant="primary"
              className="w-full sm:w-auto sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <span className="flex items-center justify-center">
                Upgrade Now
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Enrollment Confirmation Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="relative">
              {/* Header image */}
              <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat"></div>
                </div>
                <div className="relative">
                  <BookOpenIcon className="h-20 w-20 text-white/90" />
                </div>
              </div>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                size="sm"
                className="absolute top-3 right-3 text-white hover:text-gray-200 focus:outline-none bg-black/20 hover:bg-black/30 p-1 rounded-full"
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Confirm Enrollment</h3>
              <div className="mb-8">
                <div className="flex items-center mb-3">
                  <div className="mr-3 flex-shrink-0">
                    <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-inner">
                      <BookOpenIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{selectedCourse.title}</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {typeof selectedCourse.instructor === 'object' && selectedCourse.instructor 
                        ? selectedCourse.instructor.name 
                        : String(selectedCourse.instructor || 'Unknown Instructor')}
                    </p>
                    <div className="mt-3 flex items-center space-x-3">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        {formatDuration(selectedCourse.duration || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">{selectedCourse.description}</p>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-8 border-l-4 border-blue-500 pl-4 py-2">
                Are you sure you want to enroll in this course? Once enrolled, you'll have access to all course materials.
              </p>
              
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" 
                  onClick={handleConfirmEnroll}
                >
                  Confirm Enrollment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7);
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        /* Prevent card content from being cut off */
        html, body {
          overflow-x: hidden;
          scroll-behavior: smooth;
        }
        
        /* Card flex layout adjustments */
        @media (min-width: 640px) {
          .course-card {
            margin-bottom: 3rem;
          }
        }
        
        @media (min-width: 1280px) {
          .course-card {
            margin-bottom: 4rem;
          }
        }
      `}</style>
    </div>
  );
}