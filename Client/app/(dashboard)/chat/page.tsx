'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PhotoIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import Card from '@/app/components/ui/card';
import Button from '@/app/components/ui/button';
import Input from '@/app/components/forms/input';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';

// Types
interface ChatContact {
  _id: string;
  name: string;
  profilePicture: string;
  role: 'student' | 'faculty' | 'admin';
  email: string;
  status?: 'online' | 'offline' | 'away';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface ChatRoom {
  _id: string;
  name: string;
  type: 'direct' | 'group';
  participants: ChatContact[];
  admin?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: string;
    readBy: string[];
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  _id: string;
  chatRoom: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    profilePicture: string;
    role: string;
  };
  content: string;
  attachment?: string;
  attachmentType?: 'image' | 'file' | null;
  attachmentName?: string;
  readBy: string[];
  createdAt: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<{[key: string]: boolean}>({});
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ChatContact[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketInitialized = useRef(false);
  const userId = session?.user?.id;
  const roleFilter = session?.user?.role === 'faculty' ? 'student' : 'faculty';
  
  // Filter chat rooms based on user role
  const filteredChatRooms = chatRooms.filter(room => {
    // For direct chats, show only chats with users of the opposite role
    if (room.type === 'direct') {
      const otherParticipant = room.participants.find(p => p._id !== userId);
      return otherParticipant?.role === roleFilter;
    }
    
    // For group chats, always show
    return true;
  });
  
  // Initialize socket connection only once
  useEffect(() => {
    if (!session?.user || socketInitialized.current) return;
    
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const newSocket = io(serverUrl);
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });
    
    newSocket.on('receive_message', (message: ChatMessage) => {
      if (message.chatRoom === selectedRoom?._id) {
        setMessages(prev => [...prev, message]);
        
        // Update read status if the current user is viewing this chat
        markMessageAsRead(message._id, message.chatRoom);
      }
      
      // Update the chat rooms list to reflect new messages
      fetchChatRooms();
    });
    
    newSocket.on('user_typing', (data) => {
      if (data.userId !== userId) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.isTyping
        }));
        
        // Clear typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [data.userId]: false
            }));
          }, 3000);
        }
      }
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    setSocket(newSocket);
    socketInitialized.current = true;
    
    return () => {
      newSocket.disconnect();
      socketInitialized.current = false;
    };
  }, [session, userId, selectedRoom]);
  
  // Fetch chat rooms when session changes
  useEffect(() => {
    if (session?.user) {
      fetchChatRooms();
    }
  }, [session?.user]); // Only fetch when session.user changes
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // New modal user list fetch - only fetch when modal is opened
  useEffect(() => {
    if (showNewChatModal) {
      fetchAvailableUsers(roleFilter);
    }
  }, [showNewChatModal, roleFilter]);

  // Join chat room when selected
  useEffect(() => {
    if (!socket || !selectedRoom) return;
    
    // Join new room
    socket.emit('join_room', selectedRoom._id);
    
    // Cleanup on unmount or room change
    return () => {
      if (selectedRoom) {
        socket.emit('leave_room', selectedRoom._id);
      }
    };
  }, [socket, selectedRoom]);
  
  // Fetch chat rooms from API
  const fetchChatRooms = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/chat/rooms', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      setChatRooms(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
      setIsLoading(false);
    }
  };
  
  // Fetch messages for a chat room
  const fetchMessages = async (roomId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/chat/rooms/${roomId}/messages`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      setMessages(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      setIsLoading(false);
    }
  };
  
  // Mark message as read
  const markMessageAsRead = async (messageId: string, roomId: string) => {
    try {
      await axios.post(`/api/chat/messages/${messageId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  
  // Handle selecting a chat room
  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    fetchMessages(room._id);
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !session?.user.id) return;
    
    setIsSending(true);
    try {
      // Optimistically add message to UI
      const tempMessage: ChatMessage = {
        _id: `temp-${Date.now()}`,
        chatRoom: selectedRoom._id,
        sender: {
          _id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          profilePicture: session.user.image || '',
          role: session.user.role
        },
        content: newMessage,
        readBy: [session.user.id],
        createdAt: new Date().toISOString()
      };
      
      setMessages([...messages, tempMessage]);
      setNewMessage('');
      
      // Send via socket.io
      if (socket) {
        socket.emit('send_message', {
          roomId: selectedRoom._id,
          senderId: session.user.id,
          content: newMessage
        });
      }
      
      // Also send via REST API as fallback
      await axios.post(`/api/chat/rooms/${selectedRoom._id}/messages`, {
        content: newMessage
      }, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      
      setIsSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsSending(false);
    }
  };
  
  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (!socket || !selectedRoom || !session?.user) return;
    
    socket.emit('typing', {
      chatRoom: selectedRoom._id,
      userId: session.user.id,
      username: session.user.name,
      isTyping
    });
  };
  
  // Format time for display
  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'p'); // Formats to something like "10:30 AM"
    } catch (error) {
      return '';
    }
  };
  
  // Format date for message groups
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return '';
    }
  };
  
  // Get display name for a chat room
  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'group') return room.name;
    
    // For direct chats, show the other participant's name
    const otherParticipant = room.participants.find(
      p => p._id !== session?.user.id
    );
    return otherParticipant?.name || 'Chat';
  };
  
  // Get last message preview
  const getLastMessagePreview = (room: ChatRoom) => {
    if (!room.lastMessage) return 'No messages yet';
    return room.lastMessage.content.length > 30 
      ? `${room.lastMessage.content.substring(0, 30)}...` 
      : room.lastMessage.content;
  };
  
  // Get avatar for a room
  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === 'group') {
      // Default group avatar
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VycyI+PHBhdGggZD0iTTE3IDIxdi0yYTQgNCAwIDAgMC00LTRIN2E0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSI5IiBjeT0iNyIgcj0iNCIvPjxwYXRoIGQ9Ik0yMyAyMXYtMmE0IDQgMCAwIDAtMy0zLjg3Ii8+PHBhdGggZD0iTTE2IDMuMTNhNCA0IDAgMCAxIDAgNy43NSIvPjwvc3ZnPg==';
    }
    
    // For direct chats, show the other participant's avatar
    const otherParticipant = room.participants.find(
      p => p._id !== userId
    );
    return otherParticipant?.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
  };
  
  // Are there any users currently typing in this room?
  const isAnyoneTyping = Object.values(typingUsers).some(isTyping => isTyping);
  
  // Fetch available users based on role
  const fetchAvailableUsers = async (role: 'faculty' | 'student') => {
    try {
      setIsLoading(true);
      // Fixed endpoint URLs - the /list suffix was incorrect
      const endpoint = role === 'faculty' 
        ? '/api/faculty' 
        : '/api/student';
        
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      
      // Make sure we handle the response structure correctly
      const users = response.data.data || [];
      
      setAvailableUsers(users.map((user: any) => ({
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture || '',
        role: user.role,
        email: user.email
      })));
      setIsLoading(false);
    } catch (error: any) {
      console.error(`Error fetching ${role} list:`, error);
      toast.error(`Failed to load ${role} list: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  // Create a new direct chat
  const createDirectChat = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to chat with');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/chat/direct/${selectedUser}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      
      // Add the new chat room to the list if it doesn't exist
      const newRoom = response.data.data;
      setChatRooms(prev => {
        if (prev.some(room => room._id === newRoom._id)) {
          return prev;
        }
        return [newRoom, ...prev];
      });
      
      // Select the new room
      setSelectedRoom(newRoom);
      fetchMessages(newRoom._id);
      
      // Close the modal
      setShowNewChatModal(false);
      setSelectedUser('');
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating direct chat:', error);
      toast.error('Failed to create chat');
      setIsLoading(false);
    }
  };
  
  // Create a new group chat (admin only)
  const createGroupChat = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post('/api/chat/group', {
        name: groupName,
        participantIds: selectedUsers
      }, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      
      // Add the new chat room to the list
      const newRoom = response.data.data;
      setChatRooms(prev => [newRoom, ...prev]);
      
      // Select the new room
      setSelectedRoom(newRoom);
      fetchMessages(newRoom._id);
      
      // Close the modal and reset
      setShowNewChatModal(false);
      setGroupName('');
      setSelectedUsers([]);
      setIsGroupChat(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast.error('Failed to create group chat');
      setIsLoading(false);
    }
  };
  
  // Toggle user selection for group chat
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  // Now let's render the UI
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-800">Messages</h1>
        <Button 
          onClick={() => {
            setShowNewChatModal(true);
            setIsGroupChat(false);
            fetchAvailableUsers(roleFilter);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
          <span>New Message</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 h-[700px]">
        {/* Contacts List */}
        <Card className="lg:col-span-3 overflow-hidden flex flex-col h-full bg-gradient-to-b from-gray-900 to-indigo-900 text-white border-0 shadow-xl rounded-xl">
          {/* Display what type of contacts are being shown */}
          <div className="p-3 border-b border-indigo-700 bg-indigo-800 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-center text-white">
              {roleFilter === 'faculty' ? 'Faculty Contacts' : 'Student Contacts'}
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading && chatRooms.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : filteredChatRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 opacity-30 text-indigo-300" />
                <p className="text-indigo-200">No conversations found</p>
                <p className="text-xs text-indigo-300 mt-2">
                  Click "New Message" to start a conversation
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-indigo-800/50">
                {filteredChatRooms.map((room) => (
                  <li
                    key={room._id}
                    className={`cursor-pointer hover:bg-indigo-800/60 transition-all duration-200 ${
                      selectedRoom?._id === room._id ? 'bg-indigo-700' : ''
                    }`}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <div className="p-3 flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={getRoomAvatar(room)}
                          alt={getRoomDisplayName(room)}
                          className="h-12 w-12 rounded-full object-cover border-2 border-indigo-400 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1tZXNzYWdlLWNpcmNsZSI+PHBhdGggZD0iTTIxIDExLjVhOC4zOCA4LjM4IDAgMCAxLS45IDMuOCAxOC41IDE4LjUgMCAwIDEtMS4xIDIuNkEzLjE4IDMuMTggMCAwIDEgMTYuMyAyMGgtNy42QzguOSAyMCA4IDIwIDggMTlhMi4xOCAyLjE4IDAgMCAxLTIuOC0yLjFjMC0uNy4zLTEuNSAxLjEtMi42YTE4LjUgMTguNSAwIDAgMS0xLjEtMy44IDguMzggOC4zOCAwIDAgMS0uOS0zLjhjMC00LjYgNC41LTguMyAxMC01LjUgNS41LTIuOCAxMCAuOSAxMCA1LjVaTSEyIDEzYTEgMSAwIDEgMC0yIDAgMSAxIDAgMCAwIDIgMFoiLz48L3N2Zz4=';
                          }}
                        />
                        {room.type === 'direct' && (
                          <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-indigo-900 ${
                            room.participants.find(p => p._id !== userId)?.status === 'online'
                              ? 'bg-green-500'
                              : room.participants.find(p => p._id !== userId)?.status === 'away'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                          }`}></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium truncate text-white">
                            {getRoomDisplayName(room)}
                          </h3>
                          {room.lastMessage && (
                            <p className="text-xs text-indigo-200">
                              {formatTime(room.lastMessage.createdAt)}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-indigo-300 truncate">{getLastMessagePreview(room)}</p>
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold animate-pulse">
                            {room.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
        
        {/* Chat Area */}
        <Card className="lg:col-span-7 flex flex-col h-full bg-white border-0 shadow-xl rounded-xl overflow-hidden">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={getRoomAvatar(selectedRoom)}
                      alt={getRoomDisplayName(selectedRoom)}
                      className="h-10 w-10 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1tZXNzYWdlLWNpcmNsZSI+PHBhdGggZD0iTTIxIDExLjVhOC4zOCA4LjM4IDAgMCAxLS45IDMuOCAxOC41IDE4LjUgMCAwIDEtMS4xIDIuNkEzLjE4IDMuMTggMCAwIDEgMTYuMyAyMGgtNy42QzguOSAyMCA4IDIwIDggMTlhMi4xOCAyLjE4IDAgMCAxLTIuOC0yLjFjMC0uNy4zLTEuNSAxLjEtMi42YTE4LjUgMTguNSAwIDAgMS0xLjEtMy44IDguMzggOC4zOCAwIDAgMS0uOS0zLjhjMC00LjYgNC41LTguMyAxMC01LjUgNS41LTIuOCAxMCAuOSAxMCA1LjVaTSEyIDEzYTEgMSAwIDEgMC0yIDAgMSAxIDAgMCAwIDIgMFoiLz48L3N2Zz4=';
                      }}
                    />
                    {selectedRoom.type === 'direct' && (
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        selectedRoom.participants.find(p => p._id !== userId)?.status === 'online'
                          ? 'bg-green-500'
                          : selectedRoom.participants.find(p => p._id !== userId)?.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-900">{getRoomDisplayName(selectedRoom)}</h3>
                    {selectedRoom.type === 'direct' && (
                      <p className="text-xs text-indigo-500">
                        {selectedRoom.participants.find(p => p._id !== userId)?.role}
                      </p>
                    )}
                  </div>
                </div>
                <button className="text-indigo-500 hover:text-indigo-700 transition-colors duration-200">
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-indigo-50/30 to-white">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4 text-indigo-200" />
                    <p className="text-indigo-800 font-medium">No messages yet</p>
                    <p className="text-sm text-indigo-500 mt-2">Start the conversation!</p>
                  </div>
                ) : (
                  <div>
                    {/* Group messages by date */}
                    {messages.reduce((acc, message, index, array) => {
                      const messageDate = formatDate(message.createdAt);
                      
                      // Check if we need a new date header
                      if (index === 0 || formatDate(array[index - 1].createdAt) !== messageDate) {
                        acc.push(
                          <div key={`date-${message._id}`} className="flex justify-center my-4">
                            <span className="px-4 py-1 bg-indigo-100 rounded-full text-xs text-indigo-600 font-medium shadow-sm">
                              {messageDate}
                            </span>
                          </div>
                        );
                      }
                      
                      // Add the message
                      const isCurrentUser = message.sender._id === userId;
                      acc.push(
                        <div
                          key={message._id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          {!isCurrentUser && (
                            <img
                              src={message.sender.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+'}
                              alt={message.sender.name}
                              className="h-8 w-8 rounded-full object-cover mr-2 self-end border border-indigo-200 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
                              }}
                            />
                          )}
                          <div>
                            {!isCurrentUser && (
                              <p className="text-xs text-indigo-500 mb-1 font-medium">{message.sender.name}</p>
                            )}
                            <div
                              className={`p-3 rounded-2xl max-w-xs md:max-w-md break-words shadow-sm transition-all hover:shadow-md ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                                  : 'bg-white border border-indigo-100 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              {message.content}
                              {message.attachment && (
                                <div className="mt-2">
                                  {message.attachmentType === 'image' ? (
                                    <img
                                      src={message.attachment}
                                      alt={message.attachmentName || 'attachment'}
                                      className="max-w-full rounded-lg shadow-sm"
                                    />
                                  ) : (
                                    <a
                                      href={message.attachment}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center space-x-2 bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                                    >
                                      <PaperClipIcon className="h-4 w-4" />
                                      <span className="truncate">
                                        {message.attachmentName || 'Download file'}
                                      </span>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-indigo-400 mt-1">
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                      
                      return acc;
                    }, [] as React.ReactNode[])}
                    
                    {/* Typing indicator */}
                    {isAnyoneTyping && (
                      <div className="flex items-center space-x-2 mt-2 ml-2">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                          <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-xs text-indigo-500 font-medium">Someone is typing...</span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <button className="text-indigo-500 hover:text-indigo-700 transition-colors" title="Attach file">
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <button className="text-indigo-500 hover:text-indigo-700 transition-colors" title="Insert emoji">
                    <FaceSmileIcon className="h-5 w-5" />
                  </button>
                  <button className="text-indigo-500 hover:text-indigo-700 transition-colors" title="Attach photo">
                    <PhotoIcon className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 text-sm shadow-sm"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping(e.target.value.length > 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    onBlur={() => handleTyping(false)}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className={`flex items-center justify-center h-10 w-10 rounded-full ${
                      !newMessage.trim() || isSending
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                    }`}
                  >
                    {isSending ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-indigo-50 to-white">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1tZXNzYWdlLWNpcmNsZSI+PHBhdGggZD0iTTIxIDExLjVhOC4zOCA4LjM4IDAgMCAxLS45IDMuOCAxOC41IDE4LjUgMCAwIDEtMS4xIDIuNkEzLjE4IDMuMTggMCAwIDEgMTYuMyAyMGgtNy42QzguOSAyMCA4IDIwIDggMTlhMi4xOCAyLjE4IDAgMCAxLTIuOC0yLjFjMC0uNy4zLTEuNSAxLjEtMi42YTE4LjUgMTguNSAwIDAgMS0xLjEtMy44IDguMzggOC4zOCAwIDAgMS0uOS0zLjhjMC00LjYgNC41LTguMyAxMC01LjUgNS41LTIuOCAxMCAuOSAxMCA1LjVaTSEyIDEzYTEgMSAwIDEgMC0yIDAgMSAxIDAgMCAwIDIgMFoiLz48L3N2Zz4=" 
                alt="Select a conversation" 
                className="h-40 w-40 opacity-80 mb-6"
              />
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">Welcome to Chat</h3>
              <p className="text-indigo-600 max-w-md mb-6">
                Select a conversation from the sidebar or start a new one to begin messaging
              </p>
              <Button
                onClick={() => {
                  setShowNewChatModal(true);
                  setIsGroupChat(false);
                  fetchAvailableUsers(roleFilter);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>Start a New Conversation</span>
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isGroupChat ? 'New Group Chat' : 'New Message'}
              </h2>
              <button 
                onClick={() => {
                  setShowNewChatModal(false);
                  setIsGroupChat(false);
                  setSelectedUsers([]);
                  setGroupName('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              {isGroupChat ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name:
                    </label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                      className="w-full"
                    />
                  </div>
                  
                  <p className="text-sm mb-2 text-gray-700">
                    Select {roleFilter} participants for this group:
                  </p>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                      {availableUsers.map(user => (
                        <div 
                          key={user._id} 
                          className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 ${
                            selectedUsers.includes(user._id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => toggleUserSelection(user._id)}
                        >
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <img
                                src={user.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+'}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
                                }}
                              />
                              {selectedUsers.includes(user._id) && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                  <PlusIcon className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-xs capitalize text-gray-500">
                            {user.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select a {roleFilter} to message:
                  </label>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <select
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      <option value="">Select a {roleFilter}</option>
                      {availableUsers.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setIsGroupChat(false);
                  setSelectedUsers([]);
                  setGroupName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button
                onClick={isGroupChat ? createGroupChat : createDirectChat}
                disabled={(isGroupChat ? (!groupName.trim() || selectedUsers.length === 0) : !selectedUser) || isLoading}
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  `Start ${isGroupChat ? 'Group ' : ''}Chat`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 