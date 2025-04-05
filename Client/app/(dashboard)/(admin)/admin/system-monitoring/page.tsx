'use client';

import React, { useState } from 'react';
import {
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  CircleStackIcon,
  DocumentMagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import Card from '@/app/components/ui/card';
import Button from '@/app/components/ui/button';

// Types
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
}

interface UserActivity {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'success' | 'failure';
}

// Mock data
const serverMetricsData = [
  { time: '00:00', cpu: 24, memory: 38, disk: 52, network: 10 },
  { time: '04:00', cpu: 35, memory: 40, disk: 52, network: 15 },
  { time: '08:00', cpu: 60, memory: 54, disk: 53, network: 45 },
  { time: '12:00', cpu: 78, memory: 68, disk: 55, network: 90 },
  { time: '16:00', cpu: 86, memory: 72, disk: 56, network: 64 },
  { time: '20:00', cpu: 42, memory: 58, disk: 56, network: 38 },
  { time: 'Now', cpu: 30, memory: 42, disk: 57, network: 22 },
];

const userSessionsData = [
  { time: '00:00', users: 12 },
  { time: '04:00', users: 8 },
  { time: '08:00', users: 45 },
  { time: '12:00', users: 128 },
  { time: '16:00', users: 156 },
  { time: '20:00', users: 98 },
  { time: 'Now', users: 42 },
];

const recentLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2023-11-28 16:45:32',
    level: 'error',
    message: 'Database connection timeout after 30s',
    source: 'database-service',
  },
  {
    id: '2',
    timestamp: '2023-11-28 16:42:18',
    level: 'warning',
    message: 'High memory usage detected (75%)',
    source: 'monitoring-service',
  },
  {
    id: '3',
    timestamp: '2023-11-28 16:30:05',
    level: 'info',
    message: 'Scheduled backup completed successfully',
    source: 'backup-service',
  },
  {
    id: '4',
    timestamp: '2023-11-28 16:15:22',
    level: 'info',
    message: 'New course created: CS501 - Advanced AI',
    source: 'course-service',
  },
  {
    id: '5',
    timestamp: '2023-11-28 15:58:41',
    level: 'warning',
    message: 'API rate limit approaching for user ID 32',
    source: 'api-gateway',
  },
  {
    id: '6',
    timestamp: '2023-11-28 15:45:10',
    level: 'error',
    message: 'Failed to send email notifications to 3 users',
    source: 'notification-service',
  },
  {
    id: '7',
    timestamp: '2023-11-28 15:30:59',
    level: 'critical',
    message: 'Security alert: Multiple failed login attempts for admin account',
    source: 'auth-service',
  },
];

const userActivities: UserActivity[] = [
  {
    id: '1',
    user: 'Admin (admin@example.com)',
    action: 'Created',
    resource: 'New Course CS501',
    timestamp: '2023-11-28 16:42:18',
    status: 'success',
  },
  {
    id: '2',
    user: 'Dr. Lisa Wong (faculty@example.com)',
    action: 'Updated',
    resource: 'Assignment #3 in CS101',
    timestamp: '2023-11-28 16:30:05',
    status: 'success',
  },
  {
    id: '3',
    user: 'Student (student@example.com)',
    action: 'Submitted',
    resource: 'Assignment #2 in AI201',
    timestamp: '2023-11-28 16:15:22',
    status: 'success',
  },
  {
    id: '4',
    user: 'System',
    action: 'Scheduled',
    resource: 'Database Backup',
    timestamp: '2023-11-28 16:00:00',
    status: 'success',
  },
  {
    id: '5',
    user: 'Student (student45@example.com)',
    action: 'Accessed',
    resource: 'CS202 Course Materials',
    timestamp: '2023-11-28 15:55:37',
    status: 'success',
  },
  {
    id: '6',
    user: 'Anonymous',
    action: 'Login Attempt',
    resource: 'Admin Portal',
    timestamp: '2023-11-28 15:47:02',
    status: 'failure',
  },
];

export default function SystemMonitoringPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'activity'>('overview');
  const [logLevel, setLogLevel] = useState<string>('all');
  
  const filteredLogs = recentLogs.filter(
    log => logLevel === 'all' || log.level === logLevel
  );
  
  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, this would fetch fresh data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'critical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  const getActivityStatusColor = (status: string) => {
    return status === 'success'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
        
        <div className="flex space-x-2">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-200 ${
                activeTab === 'logs' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('logs')}
            >
              System Logs
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg ${
                activeTab === 'activity' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('activity')}
            >
              User Activity
            </button>
          </div>
          
          <Button
            variant="outline"
            icon={<ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <>
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-start">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <ServerIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
                  <div className="flex items-center mt-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Operational</h3>
                    <span className="h-2 w-2 rounded-full bg-green-500 ml-2"></span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All services running</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-5">
              <div className="flex items-start">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uptime</p>
                  <div className="flex items-center mt-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">99.98%</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">34 days, 2 hours</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-5">
              <div className="flex items-start">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <CircleStackIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Database</p>
                  <div className="flex items-center mt-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Healthy</h3>
                    <span className="h-2 w-2 rounded-full bg-green-500 ml-2"></span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last backup: 2 hours ago</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-5">
              <div className="flex items-start">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <ShieldCheckIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Security</p>
                  <div className="flex items-center mt-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">1 Alert</h3>
                    <span className="h-2 w-2 rounded-full bg-yellow-500 ml-2"></span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Multiple login failures</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Server Metrics Chart */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Server Metrics (Last 24 Hours)</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={serverMetricsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" name="CPU Usage (%)" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="memory" name="Memory Usage (%)" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="disk" name="Disk Usage (%)" stroke="#ffc658" />
                  <Line type="monotone" dataKey="network" name="Network Usage (%)" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Active User Sessions */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Active User Sessions</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={userSessionsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="Active Users" fill="#82ca9d" stroke="#4ade80" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Current Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">42</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Peak Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">78%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Faculty</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">22%</p>
              </div>
            </div>
          </Card>
        </>
      )}
      
      {activeTab === 'logs' && (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">System Logs</h2>
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {log.message}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No logs found matching the selected level.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      {activeTab === 'activity' && (
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <UserGroupIcon className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent User Activity</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Resource
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {userActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {activity.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {activity.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityStatusColor(activity.status)}`}>
                        {activity.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
} 