import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Key } from 'lucide-react';
import { userAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const Settings = () => {
    const { user, token, setAuth } = useAuthStore();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [savingProfile, setSavingProfile] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await userAPI.updateProfile({ name, email });
            setAuth(res.data, token);
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setSavingPassword(true);
        try {
            await userAPI.updatePassword({ oldPassword, newPassword });
            toast.success('Password changed safely!');
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Invalid old password or failed to update');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-slide-up">
            <Toaster position="top-right" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Settings</h1>
            <p className="text-slate-500 mb-8">Manage your account preferences and security.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Form */}
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <User size={20} className="mr-2 text-primary-600" />
                            Profile Information
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 bg-slate-50 rounded-lg text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 bg-slate-50 rounded-lg text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Role</label>
                                <div className="flex items-center p-3 bg-slate-100 rounded-lg text-slate-500 border border-slate-200 w-full cursor-not-allowed">
                                    <Shield size={16} className="mr-2" />
                                    <span className="capitalize font-medium">{user?.role || 'User'}</span>
                                </div>
                            </div>

                            <Button type="submit" disabled={savingProfile} className="w-full mt-4">
                                {savingProfile ? 'Updating...' : 'Save Profile'}
                            </Button>
                        </div>
                    </Card>
                </form>

                {/* Password Form */}
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <Card className="p-6 border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <Key size={20} className="mr-2 text-primary-600" />
                            Security
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 rounded-lg text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 rounded-lg text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    minLength={6}
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">Must be at least 6 characters long.</p>
                            </div>

                            <Button type="submit" variant="secondary" disabled={savingPassword} className="w-full mt-4">
                                {savingPassword ? 'Changing...' : 'Update Password'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};

export default Settings;
