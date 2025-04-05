'use client';

import React, { useState } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MegaphoneIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Button from '@/app/components/ui/button';
import Card from '@/app/components/ui/card';
import Input from '@/app/components/forms/input';

// Types
interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'faculty' | 'admins';
  status: 'draft' | 'published' | 'scheduled';
  author: string;
  createdAt: string;
  publishDate: string;
  expiryDate: string;
}

// Mock data
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Platform Maintenance Scheduled',
    content: 'The e-learning platform will be undergoing scheduled maintenance this Saturday from 2 AM to 5 AM. During this time, the system will be unavailable. We apologize for any inconvenience caused.',
    targetAudience: 'all',
    status: 'published',
    author: 'System Administrator',
    createdAt: '2023-11-20T10:30:00',
    publishDate: '2023-11-20T12:00:00',
    expiryDate: '2023-11-27T23:59:59',
  },
  {
    id: '2',
    title: 'New Courses Available for Spring Semester',
    content: 'We are excited to announce 15 new courses for the upcoming Spring semester. Registration will open on December 1st. Please check the course catalog for more details.',
    targetAudience: 'students',
    status: 'published',
    author: 'Academic Office',
    createdAt: '2023-11-15T14:20:00',
    publishDate: '2023-11-15T15:00:00',
    expiryDate: '2023-12-15T23:59:59',
  },
  {
    id: '3',
    title: 'Faculty Meeting - End of Semester Review',
    content: 'All faculty members are invited to attend the end of semester review meeting on December 10th at 3 PM in the virtual meeting room. Attendance is mandatory.',
    targetAudience: 'faculty',
    status: 'scheduled',
    author: 'Dean of Faculty',
    createdAt: '2023-11-22T09:15:00',
    publishDate: '2023-12-05T08:00:00',
    expiryDate: '2023-12-10T18:00:00',
  },
  {
    id: '4',
    title: 'System Update: New Features Added',
    content: 'We have added several new features to the platform, including improved assignment submission, enhanced discussion forums, and a new notification system. Check out the help section for more details.',
    targetAudience: 'all',
    status: 'draft',
    author: 'System Administrator',
    createdAt: '2023-11-24T16:45:00',
    publishDate: '2023-11-30T08:00:00',
    expiryDate: '2023-12-30T23:59:59',
  },
  {
    id: '5',
    title: 'Important: Final Exam Schedule Update',
    content: 'Due to unforeseen circumstances, the final exam schedule has been updated. Please check your student portal for your new exam dates and times.',
    targetAudience: 'students',
    status: 'published',
    author: 'Examination Office',
    createdAt: '2023-11-18T11:30:00',
    publishDate: '2023-11-18T12:00:00',
    expiryDate: '2023-12-20T23:59:59',
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter announcements
  const filteredAnnouncements = announcements
    .filter(announcement => 
      (statusFilter === 'all' || announcement.status === statusFilter) &&
      (audienceFilter === 'all' || announcement.targetAudience === audienceFilter) &&
      (announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       announcement.content.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Create announcement
  const handleCreateAnnouncement = () => {
    setCurrentAnnouncement(null);
    setIsModalOpen(true);
  };

  // Edit announcement
  const handleEditAnnouncement = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setIsModalOpen(true);
  };

  // Delete announcement
  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (announcementToDelete) {
      setAnnouncements(announcements.filter(a => a.id !== announcementToDelete.id));
      setIsDeleteModalOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  // Submit announcement form
  const handleSubmitAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send data to your backend
    
    // For now, we'll just simulate adding/updating an announcement
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const targetAudience = formData.get('targetAudience') as 'all' | 'students' | 'faculty' | 'admins';
    const status = formData.get('status') as 'draft' | 'published' | 'scheduled';
    const publishDate = formData.get('publishDate') as string;
    const expiryDate = formData.get('expiryDate') as string;
    
    if (currentAnnouncement) {
      // Update existing announcement
      const updatedAnnouncement: Announcement = {
        ...currentAnnouncement,
        title,
        content,
        targetAudience,
        status,
        publishDate,
        expiryDate,
      };
      
      setAnnouncements(announcements.map(a => a.id === currentAnnouncement.id ? updatedAnnouncement : a));
    } else {
      // Add new announcement
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title,
        content,
        targetAudience,
        status,
        author: 'Admin User', // In a real app, this would be the current user
        createdAt: new Date().toISOString(),
        publishDate,
        expiryDate,
      };
      
      setAnnouncements([newAnnouncement, ...announcements]);
    }
    
    setIsModalOpen(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Get audience label and color
  const getAudienceDetails = (audience: string) => {
    switch (audience) {
      case 'all':
        return { 
          label: 'Everyone', 
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
        };
      case 'students':
        return { 
          label: 'Students Only', 
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
        };
      case 'faculty':
        return { 
          label: 'Faculty Only', 
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
        };
      case 'admins':
        return { 
          label: 'Admins Only', 
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
        };
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
        
        <Button 
          variant="primary" 
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={handleCreateAnnouncement}
        >
          Create Announcement
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
          
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
          >
            <option value="all">All Audiences</option>
            <option value="students">Students Only</option>
            <option value="faculty">Faculty Only</option>
            <option value="admins">Admins Only</option>
          </select>
        </div>
      </Card>
      
      {filteredAnnouncements.length === 0 ? (
        <Card className="p-8 text-center">
          <MegaphoneIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No announcements found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            There are no announcements matching your filters. Try changing your search or create a new announcement.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleCreateAnnouncement}
            >
              Create New Announcement
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                      {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAudienceDetails(announcement.targetAudience).color}`}>
                      {getAudienceDetails(announcement.targetAudience).label}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Created: {formatDate(announcement.createdAt)}
                    </span>
                    {(announcement.status === 'scheduled' || announcement.status === 'published') && (
                      <span className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        {announcement.status === 'scheduled' ? 'Publishes on:' : 'Published on:'} {formatDate(announcement.publishDate)}
                      </span>
                    )}
                    <span className="flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Expires: {formatDate(announcement.expiryDate)}
                    </span>
                    <span className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      Author: {announcement.author}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
                
                <div className="flex md:flex-col gap-2 self-start">
                  <button
                    className="p-2 text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                    onClick={() => handleEditAnnouncement(announcement)}
                    title="Edit Announcement"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:text-red-900 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    onClick={() => handleDeleteAnnouncement(announcement)}
                    title="Delete Announcement"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create/Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAnnouncement} className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    defaultValue={currentAnnouncement?.title || ''}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    defaultValue={currentAnnouncement?.content || ''}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Audience
                    </label>
                    <select
                      id="targetAudience"
                      name="targetAudience"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      defaultValue={currentAnnouncement?.targetAudience || 'all'}
                      required
                    >
                      <option value="all">Everyone</option>
                      <option value="students">Students Only</option>
                      <option value="faculty">Faculty Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <div className="flex space-x-4 mt-2">
                      <label className="inline-flex items-center">
                        <input 
                          type="radio" 
                          name="status"
                          value="draft"
                          defaultChecked={!currentAnnouncement || currentAnnouncement.status === 'draft'}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Draft</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input 
                          type="radio" 
                          name="status"
                          value="published"
                          defaultChecked={currentAnnouncement?.status === 'published'}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Publish Now</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input 
                          type="radio" 
                          name="status"
                          value="scheduled"
                          defaultChecked={currentAnnouncement?.status === 'scheduled'}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Schedule</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Publish Date & Time
                    </label>
                    <input
                      id="publishDate"
                      name="publishDate"
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      defaultValue={currentAnnouncement?.publishDate 
                        ? new Date(currentAnnouncement.publishDate).toISOString().slice(0, 16)
                        : new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiry Date & Time
                    </label>
                    <input
                      id="expiryDate"
                      name="expiryDate"
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      defaultValue={currentAnnouncement?.expiryDate 
                        ? new Date(currentAnnouncement.expiryDate).toISOString().slice(0, 16)
                        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                >
                  {currentAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && announcementToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete the announcement <span className="font-semibold">{announcementToDelete.title}</span>? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
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