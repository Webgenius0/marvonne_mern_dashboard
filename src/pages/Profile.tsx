import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setCredentials } from '../store/authSlice';
import {
  useUpdateAdminProfileMutation,
  useChangeAdminPasswordMutation,
} from '../store/apiSlice';
import { User, Lock, Mail, Save, Loader2, KeyRound, Shield, CheckCircle2, Eye, EyeOff, Edit, X } from 'lucide-react';

const Profile = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      setIsEditModalOpen(false);
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
      const res = await changePassword({ currentPassword: oldPassword, newPassword }).unwrap();
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
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a192f] to-[#0f3a4a] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#bef264] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex items-center space-x-6 z-10">
          <div className="bg-[#bef264]/20 p-4 rounded-full ring-4 ring-[#bef264]/10">
            <User className="w-10 h-10 text-[#bef264]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Admin Profile</h1>
            <p className="text-[#bef264] font-medium mt-2 text-base sm:text-lg">Manage your account settings and security</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Settings Display */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100/50 h-fit transition-all hover:shadow-xl hover:shadow-gray-200/60 duration-300">
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-500 mt-0.5">Your basic profile details</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
              title="Edit Profile"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>

          {profileMsg.text && !isEditModalOpen && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-3 ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <Shield className="w-5 h-5 flex-shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-8 items-start pt-2">
            <div className="flex flex-col items-center mx-auto sm:mx-0">
              <div className="relative h-28 w-28 rounded-full bg-gradient-to-b from-[#0a192f] to-[#112240] p-1 shadow-lg shadow-[#0a192f]/10">
                <div className="h-full w-full rounded-full border-4 border-white flex items-center justify-center bg-[#0a192f]">
                  <span className="text-4xl font-bold text-[#bef264]">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-[3px] border-white rounded-full shadow-sm" title="Active Account"></div>
              </div>
              <div className="mt-4 px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-600 tracking-widest uppercase flex items-center space-x-1.5 shadow-sm">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>Administrator</span>
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-6 sm:pt-4">
              <div className="group">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </h4>
                <div className="text-gray-900 font-semibold text-lg pb-3 border-b border-gray-100 group-hover:border-gray-200 transition-colors">
                  {user?.name || 'Admin User'}
                </div>
              </div>
              
              <div className="group">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </h4>
                <div className="text-gray-900 font-semibold text-lg pb-3 border-b border-gray-100 group-hover:border-gray-200 transition-colors">
                  {user?.email || 'admin@example.com'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100/50 h-fit transition-all hover:shadow-xl hover:shadow-gray-200/60 duration-300">
          <div className="flex items-center space-x-3 pb-6 border-b border-gray-100 mb-8">
            <div className="bg-rose-50 p-2.5 rounded-xl">
              <Shield className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500 mt-0.5">Update your password</p>
            </div>
          </div>

          {passwordMsg.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-3 ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <Shield className="w-5 h-5 flex-shrink-0" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Current Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                </div>
                <input
                  type={showOldPassword ? "text" : "password"}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pl-11 pr-11 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-11 pr-11 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11 pr-11 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full flex items-center justify-center space-x-2 px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
              {profileMsg.text && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-3 ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <Shield className="w-5 h-5 flex-shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-[#0a192f] hover:bg-[#0a192f]/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
