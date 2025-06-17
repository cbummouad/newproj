import React, { useEffect, useState } from 'react';
import Notifications from '../Components/Notifications';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage, router } from '@inertiajs/react'; // Added router import
import Dropdown from '../Components/Dropdown';

import {
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Users,
  ChevronDown,
  Send,
  Eye
} from 'lucide-react';

const AdminDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
        const response = await fetch('/complaints');
        const data = await response.json();
        setComplaints(data);
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab === 'users') {
        const response = await fetch('/admin/users');
        const data = await response.json();
        setUsers(data);
      }
    };

    fetchUsers();
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);

    } catch (error) {
      console.error('Error changing role:', error);
      alert(`Failed to change role: ${error.message}`);
    }
  };

  const handleComplaintResponse = async (complaintId) => {
    if (!responseText.trim()) return;

    try {
      const response = await fetch(`/complaints/${complaintId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ response: responseText })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // Update the complaint status locally
      const updatedComplaints = complaints.map(complaint =>
        complaint.id === complaintId ? { ...complaint, status: 'responded', response: responseText } : complaint
      );
      setComplaints(updatedComplaints);
      setResponseText('');

      // Close the expanded view
      setExpandedComplaint(null);

    } catch (error) {
      console.error('Error responding to complaint:', error);
      alert(`Failed to respond to complaint: ${error.message}`);
    }
  };

  const toggleComplaintExpand = (complaintId) => {
    if (expandedComplaint === complaintId) {
      setExpandedComplaint(null);
    } else {
      setExpandedComplaint(complaintId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Toggle Button for Mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="fixed lg:static w-64 h-screen bg-white shadow-lg z-40"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-green-600 mb-8">Admin Panel</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('complaints')}
                  className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    activeTab === 'complaints'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-green-50'
                  }`}
                >
                  <MessageSquare size={20} />
                  <span>Complaints</span>
                  <ChevronRight size={16} className="ml-auto" />
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    activeTab === 'users'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-green-50'
                  }`}
                >
                  <Users size={20} />
                  <span>User Management</span>
                  <ChevronRight size={16} className="ml-auto" />
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-green-50'
                  }`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                  <ChevronRight size={16} className="ml-auto" />
                </button>
                <Link
                  href={route('logout')}
                  method="post"
                  as="button"
                  className="w-full flex items-center space-x-2 p-3 rounded-lg transition-colors text-gray-600 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Notifications notifications={notifications} />

      {/* Main Content */}
      <motion.div
        layout
        className="flex-1 p-8 lg:p-12"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'complaints' && (
            <motion.div
              key="complaints"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h1 className="text-3xl font-bold text-gray-800">User Complaints</h1>
              <div className="grid gap-6">
                {complaints.length > 0 ? complaints.map((complaint) => (
                    <motion.div
                        key={complaint.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <User className="text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-800">{complaint.title}</h3>
                                    <p className="text-sm text-gray-500">{complaint.created_at}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    complaint.status === 'responded' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {complaint.status || 'Pending'}
                                </span>
                            </div>
                        </div>
                        <h4 className="font-medium text-gray-800 mb-2">{complaint.type}</h4>
                        <p className="text-gray-600 mb-4">{complaint.message}</p>

                        <button
                            onClick={() => toggleComplaintExpand(complaint.id)}
                            className="flex items-center text-green-600 hover:text-green-800 transition-colors"
                        >
                            <Eye size={16} className="mr-1" />
                            <span>See More</span>
                            <ChevronDown size={16} className={`ml-1 transform transition-transform ${expandedComplaint === complaint.id ? 'rotate-180' : ''}`} />
                        </button>

                        {expandedComplaint === complaint.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 border-t pt-4"
                            >
                                {complaint.image && (
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-600 mb-2">Attached Image:</h5>
                                        <img
                                            src={complaint.image}
                                            alt="Complaint evidence"
                                            className="rounded-lg max-h-64 object-contain"
                                        />
                                    </div>
                                )}

{complaint.status === 'pending' && (
    <div className="mt-4">
        <h5 className="text-sm font-medium text-gray-600 mb-2">Choose Status:</h5>
        <select
            value={complaint.status}
            onChange={async (e) => {
                const newStatus = e.target.value;
                try {
                    const response = await fetch(`/admin/complaints/${complaint.id}/status`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: JSON.stringify({ status: newStatus })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error ${response.status}`);
                    }

                    // Update the complaint status locally
                    const updatedComplaints = complaints.map(c =>
                        c.id === complaint.id ? { ...c, status: newStatus } : c
                    );
                    setComplaints(updatedComplaints);
                } catch (error) {
                    console.error('Error updating complaint status:', error);
                    alert(`Failed to update status: ${error.message}`);
                }
            }}
            className="bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
        </select>
    </div>
)}

                                {complaint.response && (
                                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                        <h5 className="text-sm font-medium text-gray-600 mb-2">Admin Response:</h5>
                                        <p className="text-gray-800">{complaint.response}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )) : (
                    <p className="text-gray-600">No complaints available.</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-4">User Management</h1>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length > 0 ? users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{user.id}</td>
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-600">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
              <div className="bg-white p-6 rounded-xl shadow-sm space-y-8">
                {/* Profile Settings */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={usePage().props.auth.user.name}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={usePage().props.auth.user.email}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    router.post(route('admin.updatePassword'), {
                      current_password: e.target.current_password.value,
                      new_password: e.target.new_password.value,
                      new_password_confirmation: e.target.confirm_password.value
                    });
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        name="current_password"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        name="new_password"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        name="confirm_password"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Notification Preferences */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    router.post(route('admin.updateNotifications'), {
                      email_notifications: e.target.email_notifications.checked,
                      push_notifications: e.target.push_notifications.checked
                    });
                  }} className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        name="email_notifications"
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700">Email Notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        name="push_notifications"
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700">Push Notifications</span>
                    </label>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Save Preferences
                    </button>
                  </form>
                </div>

                {/* System Settings */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">System Settings</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    router.post(route('admin.updateSystemSettings'), {
                      timezone: e.target.timezone.value,
                      language: e.target.language.value
                    });
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select
                        name="timezone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="GMT">GMT</option>
                        <option value="EST">EST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select
                        name="language"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Save Settings
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

