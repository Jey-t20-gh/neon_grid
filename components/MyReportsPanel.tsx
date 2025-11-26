
import React, { useEffect, useState } from 'react';
import { Issue } from './IssueDetailsPanel';
import { auth, db } from './firebaseConfig';

// Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-8 w-8 text-cyan-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ThumbsUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
);

const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Resolved') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    }
    if (status === 'In Progress') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
    }
    // Open
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'Open': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'Resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

interface MyReportsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onViewDetails: (issue: Issue) => void;
}

const MyReportsPanel: React.FC<MyReportsPanelProps> = ({ isOpen, onClose, onViewDetails }) => {
    const [reports, setReports] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        // Real-time listener for the reports
        const unsubscribe = db.collection('reports')
            .where('userId', '==', user.uid)
            .onSnapshot((snapshot) => {
                const fetchedReports = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Convert Firestore Timestamp to a JS Date object if present
                    const dateObj = data.createdAt ? data.createdAt.toDate() : new Date();
                    const dateString = dateObj.toISOString().split('T')[0]; // Format YYYY-MM-DD

                    return {
                        id: doc.id,
                        title: data.title,
                        category: data.category,
                        status: data.status,
                        date: dateString,
                        imageUrl: data.imageUrl,
                        description: data.description,
                        location: data.location || '',
                        voteCount: data.voteCount || 0,
                        votedBy: data.votedBy || [],
                        _createdAt: dateObj // Internal property for sorting
                    };
                });

                // Client-side sort descending by date to avoid index creation requirements immediately
                fetchedReports.sort((a: any, b: any) => b._createdAt - a._createdAt);
                
                setReports(fetchedReports as Issue[]);
                setLoading(false);
                setError(null);
            }, (error: any) => {
                console.error("Error fetching reports: ", error);
                if (error.code === 'permission-denied') {
                    setError("Access denied. Check Firestore Security Rules.");
                } else {
                    setError("Failed to load reports.");
                }
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);
    
    return (
        <div 
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0b0f1a]/85 backdrop-blur-md p-6 text-white border-l border-violet-500/30 shadow-[-10px_0_30px_rgba(139,92,246,0.2)] transition-transform duration-500 ease-in-out z-50
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-reports-title"
        >
            <style>{`
                @keyframes slideUpFadeInPanel {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .report-card-animation {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: slideUpFadeInPanel 0.5s ease-out forwards;
                }
                .custom-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-violet-500/20">
                <h2 id="my-reports-title" className="text-2xl font-bold text-violet-400 uppercase tracking-wider" style={{ textShadow: '0 0 4px #8b5cf6' }}>
                    My Reports
                </h2>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full text-violet-400 hover:bg-violet-500/20 transition-colors"
                    aria-label="Close panel"
                >
                    <CloseIcon />
                </button>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto h-[calc(100%-70px)] mt-6 custom-scrollbar pr-2 -mr-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40">
                        <SpinnerIcon />
                        <p className="mt-4 text-violet-300/70 text-sm">Fetching data protocols...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-40 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-300 font-bold">{error}</p>
                        <p className="text-red-300/70 text-xs mt-1">Ensure your database rules allow read access for authenticated users.</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-4 border border-dashed border-violet-500/30 rounded-lg bg-black/20">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-violet-500/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                         <p className="text-violet-300">No reports logged in the system.</p>
                         <p className="text-sm text-violet-300/50 mt-1">Submit a new anomaly to see it here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report, index) => (
                            <div 
                                key={report.id}
                                className="bg-black/30 p-4 rounded-lg border border-cyan-400/20 report-card-animation flex gap-4 items-start"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <img src={report.imageUrl} alt={report.title} className="w-20 h-20 object-cover rounded-md border-2 border-cyan-400/30" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full border border-violet-500/30">
                                            {report.category}
                                        </span>
                                        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full border ${getStatusStyles(report.status)}`}>
                                            <StatusIcon status={report.status} />
                                            {report.status}
                                        </span>
                                    </div>
                                    <h3 className="mt-2 font-bold text-cyan-300">{report.title}</h3>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-violet-300/70">{report.date}</p>
                                        <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-cyan-400/20" title="Votes from community">
                                            <ThumbsUpIcon />
                                            <span className="text-xs font-bold text-cyan-300">{report.voteCount || 0}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onViewDetails(report)}
                                        className="mt-3 text-xs w-full text-center py-1.5 bg-cyan-500/10 border border-cyan-400 rounded-md text-cyan-400 font-semibold uppercase tracking-wider hover:bg-cyan-400 hover:text-black transition-all duration-300"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReportsPanel;
