import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MapPin, Calendar, Clock, ArrowLeft, Image as ImageIcon, AlertCircle, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
                    {/* Duplicate Banner */}
                    {complaint.duplicate && (
                        <div className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-4 flex items-start shadow-md">
                            <AlertCircle className="text-orange-500 mr-3 mt-0.5 flex-shrink-0" size={22} />
                            <div>
                                <h4 className="text-orange-800 font-bold text-sm">⚠️ Possible Duplicate Report</h4>
                                <p className="text-orange-700 text-sm mt-1">
                                    Our AI detected this issue might have been previously reported.
                                    {complaint.duplicateReference && (
                                        <Link to={`/complaints/${complaint.duplicateReference}`} className="ml-1 inline-flex items-center gap-1 font-semibold text-orange-900 underline decoration-orange-400 hover:text-orange-950 hover:decoration-2 transition-all">
                                            View original Complaint #{complaint.duplicateReference.substring(complaint.duplicateReference.length - 6)} →
                                        </Link>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

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

                        <div className="flex items-center justify-between mt-8 mb-4 relative">
                            {/* Background Line */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>

                            {/* Progress Line */}
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 rounded-full z-0 transition-all duration-500"
                                style={{ width: complaint.status === 'Resolved' ? '100%' : complaint.status === 'In-Progress' ? '50%' : '0%' }}
                            ></div>

                            {/* Steps */}
                            {['Submitted', 'In-Progress', 'Resolved'].map((step, idx) => {
                                // Find if this step is reached
                                const historyStep = complaint.statusHistory?.find(h => h.status === step);
                                // Default Submitted to createdAt if missing in history
                                const date = step === 'Submitted' && !historyStep ? complaint.createdAt : historyStep?.date;

                                const statusOrder = { 'Submitted': 0, 'In-Progress': 1, 'Resolved': 2 };
                                const currentOrder = statusOrder[complaint.status] || 0;
                                const isCompleted = idx <= currentOrder;
                                const isCurrent = idx === currentOrder;

                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 ${isCompleted ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {isCompleted && !isCurrent ? <CheckCircle2 size={18} /> : isCurrent ? <Clock size={18} className="animate-pulse" /> : <Circle size={18} />}
                                        </div>
                                        <div className="mt-3 text-center">
                                            <p className={`text-sm font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step}</p>
                                            {date && (
                                                <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                                                    {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                            <Sparkles size={16} className="mr-2 text-primary-600" /> AI Assessment
                        </h3>
                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-slate-500">Category</span>
                                <Badge variant="neutral" className="font-semibold">{complaint.category}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-slate-500">Severity</span>
                                <Badge variant={
                                    complaint.severity === 'Hazardous' ? 'danger' :
                                        complaint.severity === 'Severe' ? 'orange' :
                                            complaint.severity === 'Moderate' ? 'yellow' : 'success'
                                }>
                                    {complaint.severity || 'Unknown'}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-slate-500">Priority</span>
                                <Badge variant={
                                    complaint.priority === 'High' ? 'danger' :
                                        complaint.priority === 'Medium' ? 'warning' : 'success'
                                }>
                                    {complaint.priority}
                                </Badge>
                            </div>
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
                            {complaint.slaDeadline && (
                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                    <span className="flex items-center"><Clock size={14} className="mr-2 text-slate-400" /> Resolution Deadline</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">{new Date(complaint.slaDeadline).toLocaleDateString()}</span>
                                        {(() => {
                                            const now = new Date();
                                            const deadline = new Date(complaint.slaDeadline);
                                            const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                                            const isResolved = complaint.status === 'Resolved';
                                            if (diffDays < 0 && !isResolved) return <Badge variant="danger" className="text-[10px] px-1.5 py-0">Overdue</Badge>;
                                            if (diffDays >= 0 && diffDays <= 1 && !isResolved) return <Badge variant="warning" className="text-[10px] px-1.5 py-0">Due Soon</Badge>;
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
