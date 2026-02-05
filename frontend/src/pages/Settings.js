import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Key } from 'lucide-react';

const Settings = () => {
    const { user } = useAuthStore();

    return (
        <div className="max-w-4xl mx-auto animate-slide-up">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-500 mb-8">Manage your account preferences and profile.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <User size={20} className="mr-2 text-primary-600" />
                            Profile Information
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                                <div className="p-3 bg-slate-50 rounded-lg text-slate-900 border border-slate-200">
                                    {user?.name || 'User'}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                                <div className="flex items-center p-3 bg-slate-50 rounded-lg text-slate-900 border border-slate-200">
                                    <Mail size={16} className="mr-2 text-slate-400" />
                                    {user?.email || 'user@example.com'}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Role</label>
                                <div className="flex items-center p-3 bg-slate-50 rounded-lg text-slate-900 border border-slate-200 w-full sm:w-1/3">
                                    <Shield size={16} className="mr-2 text-slate-400" />
                                    <span className="capitalize">{user?.role || 'student'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 opacity-60">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                <Key size={20} className="mr-2 text-primary-600" />
                                Security
                            </h3>
                            <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Coming Soon</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Password change functionality is currently under development.</p>
                        <Button disabled variant="outline">Change Password</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;
