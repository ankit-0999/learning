import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Define TypeScript interfaces for models
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
  profilePicture?: string;
  department?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string | User;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  thumbnail?: string;
  isPublished: boolean;
  enrolledStudents: string[] | User[];
  lectures: Lecture[];
  createdAt: string;
  updatedAt: string;
}

export interface Lecture {
  _id?: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  contentType: 'video' | 'document' | 'image' | 'text';
  duration?: number;
  order?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  totalPages?: number;
  currentPage?: number;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from NextAuth session instead of localStorage
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    
    // Handle 401 Unauthorized errors (token expired)
    if (response && response.status === 401 && !config._retry) {
      // Redirect to login page for re-authentication
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=session_expired';
      }
    }
    
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      api.post('/api/auth/login', credentials),
    register: (userData: any) => 
      api.post('/api/auth/register', userData),
    forgotPassword: (email: string) => 
      api.post('/api/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) => 
      api.post('/api/auth/reset-password', { token, password }),
  },
  
  // Public endpoints (no auth required)
  courses: {
    getPublishedCourses: () => api.get('/api/courses/published'),
    getCourseById: (courseId: string) => api.get(`/api/courses/${courseId}`),
  },
  
  // Student endpoints
  student: {
    getProfile: () => api.get('/api/student/profile'),
    updateProfile: (data: any) => api.put('/api/student/profile', data),
    getCourses: () => api.get('/api/student/courses'),
    getCourseById: (courseId: string) => api.get(`/api/student/courses/${courseId}`),
    getAssignments: () => api.get('/api/student/assignments'),
    getAssignmentById: (id: string) => api.get(`/api/student/assignments/${id}`),
    submitAssignment: (assignmentId: string, data: FormData) => 
      api.post(`/api/student/assignments/${assignmentId}/submit`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }),
    enrollCourse: (courseId: string) => api.post(`/api/student/courses/${courseId}/enroll`),
    getCourseLectures: (courseId: string) => api.get(`/api/student/courses/${courseId}/lectures`),
  },
  
  // Faculty endpoints
  faculty: {
    getProfile: () => api.get('/api/faculty/profile'),
    updateProfile: (data: any) => api.put('/api/faculty/profile', data),
    getCourses: () => api.get('/api/faculty/courses'),
    getCourseById: (courseId: string) => api.get(`/api/faculty/courses/${courseId}`),
    addLecture: (courseId: string, data: Lecture) => api.post(`/api/faculty/courses/${courseId}/lectures`, data),
    deleteLecture: (courseId: string, lectureId: string) => api.delete(`/api/faculty/courses/${courseId}/lectures/${lectureId}`),
    getAssignments: () => api.get('/api/faculty/assignments'),
    getAssignmentById: (id: string) => api.get(`/api/faculty/assignments/${id}`),
    createAssignment: (data: any) => {
      // Ensure we're using FormData correctly
      if (!(data instanceof FormData)) {
        const formData = new FormData();
        // Add each property to the FormData object
        Object.keys(data).forEach(key => {
          formData.append(key, String(data[key]));
        });
        data = formData;
      }
      
      return api.post('/api/faculty/assignments', data, {
        headers: {
          // Let the browser set the content-type for FormData
        }
      });
    },
    updateAssignment: (id: string, data: any) => {
      // Ensure we're using FormData correctly
      if (!(data instanceof FormData)) {
        const formData = new FormData();
        // Add each property to the FormData object
        Object.keys(data).forEach(key => {
          formData.append(key, String(data[key]));
        });
        data = formData;
      }
      
      return api.put(`/api/faculty/assignments/${id}`, data, {
        headers: {
          // Let the browser set the content-type for FormData
        }
      });
    },
    deleteAssignment: (id: string) => api.delete(`/api/faculty/assignments/${id}`),
    gradeAssignment: (assignmentId: string, submissionId: string, gradeData: any) => 
      api.post(`/api/faculty/assignments/${assignmentId}/grade/${submissionId}`, gradeData),
  },
  
  // Admin endpoints
  admin: {
    getUsers: () => api.get('/api/admin/users'),
    createUser: (data: any) => api.post('/api/admin/users', data),
    updateUser: (id: string, data: any) => api.put(`/api/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`),
    getAllCourses: () => api.get('/api/admin/courses'),
    getCourseById: (id: string) => api.get(`/api/admin/courses/${id}`),
    createCourse: (data: any) => {
      // Convert regular object to FormData if it's not already FormData
      let formData: FormData;
      if (!(data instanceof FormData)) {
        formData = new FormData();
        // Add each property to the FormData object
        Object.keys(data).forEach(key => {
          formData.append(key, String(data[key]));
        });
      } else {
        formData = data;
      }
      
      return api.post('/api/admin/courses', formData, {
        headers: {
          // Let the browser set the content-type for FormData
        },
      });
    },
    updateCourse: (id: string, data: any) => {
      // Convert regular object to FormData if it's not already FormData
      let formData: FormData;
      if (!(data instanceof FormData)) {
        formData = new FormData();
        // Add each property to the FormData object
        Object.keys(data).forEach(key => {
          formData.append(key, String(data[key]));
        });
      } else {
        formData = data;
      }
      
      return api.put(`/api/admin/courses/${id}`, formData, {
        headers: {
          // Let the browser set the content-type for FormData
        },
      });
    },
    deleteCourse: (id: string) => api.delete(`/api/admin/courses/${id}`),
    getFacultyMembers: () => api.get('/api/admin/faculty'),
    getDashboardStats: () => api.get('/api/admin/dashboard'),
  },
};

export default apiService; 