import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setCredentials } from '../store/authSlice';
import {
  useUpdateAdminProfileMutation,
  useChangeAdminPasswordMutation,
} from '../store/apiSlice';
import { User, Lock, Mail, Save, Loader2, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateAdminProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangeAdminPasswordMutation();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    try {
      const res = await updateProfile({ name, email }).unwrap();
      // Update local storage / redux
      if (token) {
        dispatch(setCredentials({ user: { ...user, name, email }, token }));
      }
      setProfileMsg({ text: res.message || 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setProfileMsg({
        text: err?.data?.message || 'Failed to update profile.',
        type: 'error',
      });
    }
    setTimeout(() => setProfileMsg({ text: '', type: '' }), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });
    
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      const res = await changePassword({ oldPassword, newPassword }).unwrap();
      setPasswordMsg({ text: res.message || 'Password changed successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({
        text: err?.data?.message || 'Failed to change password.',
        type: 'error',
      });
    }
    setTimeout(() => setPasswordMsg({ text: '', type: '' }), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account settings and password</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 mb-6">
            <User className="w-5 h-5 text-[#3CCFBD]" />
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          </div>

          {profileMsg.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center space-x-2 px-6 py-3 bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 mb-6">
            <KeyRound className="w-5 h-5 text-[#3CCFBD]" />
            <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
          </div>

          {passwordMsg.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center space-x-2 px-6 py-3 bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
