import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings as SettingsIcon, Bell, Shield, Map } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        adminEmail: '',
        autoEscalationEnabled: false,
        escalationThreshold: 48,
        notificationPreferences: {
            newComplaint: true,
            statusUpdates: true,
            highPriority: true
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await settingsAPI.get();
            if (res.data) setSettings(res.data);
        } catch (err) {
            console.error('Failed to load settings', err);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await settingsAPI.update(settings);
            toast.success('Settings saved successfully');
        } catch (err) {
            console.error('Failed to save settings', err);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Loading settings...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto animate-slide-up">
            <Toaster position="top-right" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Global Settings</h1>
            <p className="text-slate-500 mb-8">Administrate automated workflows and system preferences.</p>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                        <Shield size={20} className="mr-2 text-primary-600" />
                        Escalation & Routing
                    </h3>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <label className="font-medium text-slate-800 block">Auto-Escalation</label>
                                <span className="text-xs text-slate-500">Automatically escalate unresolved high priority tickets.</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer"
                                    checked={settings.autoEscalationEnabled}
                                    onChange={(e) => setSettings({ ...settings, autoEscalationEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {settings.autoEscalationEnabled && (
                            <div className="p-4 bg-white rounded-lg border border-slate-200">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Escalation Threshold (Hours)</label>
                                <input
                                    type="number"
                                    value={settings.escalationThreshold}
                                    onChange={(e) => setSettings({ ...settings, escalationThreshold: Number(e.target.value) })}
                                    className="w-full md:w-1/3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    min="1"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Admin Contact Email</label>
                            <input
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                                className="w-full md:w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="admin@college.edu"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                        <Bell size={20} className="mr-2 text-primary-600" />
                        Admin Notification Preferences
                    </h3>

                    <div className="space-y-3">
                        {['newComplaint', 'statusUpdates', 'highPriority'].map(key => (
                            <label key={key} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={settings.notificationPreferences[key]}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notificationPreferences: {
                                            ...settings.notificationPreferences,
                                            [key]: e.target.checked
                                        }
                                    })}
                                    className="w-5 h-5 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-slate-700 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()} Alerts
                                </span>
                            </label>
                        ))}
                    </div>
                </Card>

                <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                    <Button variant="outline" type="button" onClick={fetchSettings}>Discard Changes</Button>
                    <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
