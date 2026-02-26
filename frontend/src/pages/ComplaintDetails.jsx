import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MapPin, Calendar, Clock, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const response = await complaintsAPI.getOne(id);
                setComplaint(response.data);
            } catch (error) {
                console.error('Failed to fetch complaint details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaint();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20 animate-pulse">
                <div className="h-12 w-12 bg-primary-200 rounded-full"></div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="text-center p-20">
                <h2 className="text-2xl font-bold text-slate-800">Report Not Found</h2>
                <button className="mt-4 text-primary-600 font-medium hover:underline" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
            <div className="flex items-center space-x-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Report Details</h1>
                    <p className="text-sm text-slate-500">View information and timeline progression.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details (Left) */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden border-0 shadow-lg group">
                        <div className="h-80 relative bg-slate-100 flex items-center justify-center">
                            {complaint.image?.url ? (
                                <img src={complaint.image.url} alt="Damage evidence" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={64} className="text-slate-300" />
                            )}
                            <div className="absolute top-4 right-4 flex space-x-2">
                                <Badge variant={complaint.priority === 'High' ? 'danger' : complaint.priority === 'Medium' ? 'warning' : 'success'} className="shadow-lg backdrop-blur-md">
                                    {complaint.priority} Priority
                                </Badge>
                                <Badge variant="neutral" className="shadow-lg backdrop-blur-md">{complaint.category}</Badge>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-2 text-slate-600 font-medium">
                                    <MapPin size={18} className="text-primary-500" />
                                    <span className="text-lg text-slate-800">{complaint.location}</span>
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none mb-6">
                                <h3 className="text-base font-semibold text-slate-800 mb-2">Description</h3>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {complaint.note || "No additional description provided by the user."}
                                </p>
                            </div>

                            {complaint.adminNotes && (
                                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <h3 className="text-sm font-semibold text-amber-800 mb-2">Admin Remarks</h3>
                                    <p className="text-amber-700 text-sm">{complaint.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Timeline (Right) */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            <Clock size={20} className="mr-2 text-primary-600" /> Progress Timeline
                        </h3>

                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                            {(complaint.statusHistory && complaint.statusHistory.length > 0 ? complaint.statusHistory : [{ status: 'Submitted', date: complaint.createdAt }]).map((history, idx, arr) => {
                                const isLast = idx === arr.length - 1;
                                return (
                                    <div key={idx} className="relative pl-6">
                                        <span
                                            className={`absolute -left-2.5 top-1 h-5 w-5 rounded-full flex items-center justify-center ring-4 ring-white
                        ${isLast ? 'bg-primary-500' : 'bg-slate-300'}
                      `}
                                        />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${isLast ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {history.status}
                                            </span>
                                            <span className="text-xs text-slate-400 mt-1">
                                                {new Date(history.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4">Metadata</h3>
                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="flex items-center"><Calendar size={14} className="mr-2 text-slate-400" /> Reported On</span>
                                <span className="font-medium text-slate-900">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-slate-500">Current Status</span>
                                <Badge variant={complaint.status === 'Resolved' ? 'success' : complaint.status === 'In-Progress' ? 'default' : 'warning'}>
                                    {complaint.status}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
