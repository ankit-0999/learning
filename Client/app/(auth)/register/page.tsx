'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Input from '@/app/components/forms/input';
import Button from '@/app/components/ui/button';
import Link from 'next/link';
import apiService from '@/app/lib/utils/api';
import { toast } from 'react-hot-toast';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'faculty';
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    },
  });

  const password = watch("password");
  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    // Display a helpful error message when trying to register as faculty
    if (data.role === 'faculty') {
      setError('Faculty accounts can only be created by administrators. Please contact the admin or select "Student".');
      setIsLoading(false);
      return;
    }

    try {
      // Remove confirmPassword field as it's not needed for the API
      const { confirmPassword, ...registerData } = data;
      
      // Make API call to register endpoint
      const response = await apiService.auth.register(registerData);
      
      // On successful registration, redirect to login page
      if (response.data.success) {
        toast.success('Registration successful! Please log in.');
        router.push('/login?registered=true');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Display error message from API if available
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Create a new account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join our e-learning platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Information notice about account types */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Only student accounts can be created through this form. Faculty and admin accounts require administrator approval.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Full Name"
              {...register('name', { required: 'Name is required' })}
              type="text"
              placeholder="Full name"
              error={errors.name?.message}
            />
            
            <Input
              label="Email Address"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                }
              })}
              type="email"
              placeholder="Email address"
              error={errors.email?.message}
            />
            
            <Input
              label="Password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                }
              })}
              type="password"
              placeholder="Password"
              error={errors.password?.message}
            />
            
            <Input
              label="Confirm Password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || "Passwords do not match"
              })}
              type="password"
              placeholder="Confirm password"
              error={errors.confirmPassword?.message}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                I am registering as
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    {...register('role')} 
                    value="student" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Student</span>
                </label>
                <label className={`inline-flex items-center ${selectedRole === 'faculty' ? 'text-gray-400' : ''}`}>
                  <input 
                    type="radio" 
                    {...register('role')} 
                    value="faculty" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Faculty</span>
                  <span className="ml-1 text-xs text-red-500">(admin only)</span>
                </label>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
              {selectedRole === 'faculty' && (
                <p className="mt-1 text-xs text-red-600">
                  Faculty accounts require administrator approval.
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 