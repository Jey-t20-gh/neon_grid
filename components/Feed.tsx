
import React, { useState, useEffect, useMemo } from 'react';
import { Issue } from './IssueDetailsPanel';
import { auth, db } from './firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Reusable Status Icon and Style logic
const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Resolved') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    }
    if (status === 'In Progress') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
    }
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

// Filter Icon
const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const TagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-8 w-8 text-cyan-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ThumbsUpIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-300 ${filled ? 'text-cyan-400 fill-cyan-400' : 'text-violet-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
);

interface ExtendedIssue extends Issue {
    reporter: string;
    time: string;
    hasVoted: boolean; // Local UI state helper
    userId: string;
    _createdAt: Date; // For sorting
}

interface FeedProps {
    onViewDetails: (issue: Issue) => void;
}

const CATEGORIES = ['Road', 'Garbage', 'Water', 'Electricity', 'Infrastructure', 'Other'];

const Feed: React.FC<FeedProps> = ({ onViewDetails }) => {
    const [reports, setReports] = useState<ExtendedIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<'latest' | 'priority'>('priority'); // Default to Priority
    
    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState<'none' | 'location' | 'category'>('none');
    const [filterValue, setFilterValue] = useState('');
    const [tempLocationSearch, setTempLocationSearch] = useState('');

    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    // Fetch data always ordered by Date Descending to get the latest batch
    // We then sort client-side to ensure mixed lists (voted vs non-voted) work correctly
    useEffect(() => {
        setLoading(true);
        setError(null);
        const user = auth.currentUser;

        // Fetch latest 100 items to ensure we have a good pool to sort from
        const query = db.collection('reports').orderBy('createdAt', 'desc').limit(100);

        const unsubscribe = query
            .onSnapshot((snapshot) => {
                const fetchedReports = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const dateObj = data.createdAt ? data.createdAt.toDate() : new Date();
                    
                    const reporterName = `Citizen_${data.userId ? data.userId.substring(0, 5).toUpperCase() : 'Anon'}`;
                    
                    const voteCount = data.voteCount || 0;
                    const votedBy = data.votedBy || [];
                    const hasVoted = user ? votedBy.includes(user.uid) : false;

                    return {
                        id: doc.id,
                        title: data.title,
                        category: data.category,
                        status: data.status,
                        imageUrl: data.imageUrl,
                        description: data.description,
                        location: data.location || '',
                        date: dateObj.toISOString().split('T')[0],
                        time: timeAgo(dateObj),
                        reporter: reporterName,
                        voteCount: voteCount,
                        votedBy: votedBy,
                        hasVoted: hasVoted,
                        userId: data.userId || '',
                        _createdAt: dateObj
                    } as ExtendedIssue;
                });

                setReports(fetchedReports);
                setLoading(false);
            }, (err: any) => {
                console.error("Feed fetch error:", err);
                if (err.code === 'permission-denied') {
                    setError("Access Denied: Public feed requires 'read' permissions in Firestore rules.");
                } else {
                    setError("Unable to load live feed. Ensure indexes are created.");
                }
                setLoading(false);
            });

        return () => unsubscribe();
    }, []); // Only run once on mount

    // Handle Sorting Logic Efficiently
    const sortedReports = useMemo(() => {
        const items = [...reports];
        if (sortMode === 'priority') {
            return items.sort((a, b) => {
                // Primary Sort: Vote Count Descending
                const voteDiff = (b.voteCount || 0) - (a.voteCount || 0);
                if (voteDiff !== 0) return voteDiff;
                // Secondary Sort: Date Descending
                return b._createdAt.getTime() - a._createdAt.getTime();
            });
        }
        // Default: Date Descending (already fetched in this order, but ensuring consistency)
        return items.sort((a, b) => b._createdAt.getTime() - a._createdAt.getTime());
    }, [reports, sortMode]);

    // Handle Filtering Logic on the sorted list
    const displayedReports = useMemo(() => {
        return sortedReports.filter(report => {
            if (filterType === 'none') return true;
            if (filterType === 'category') return report.category === filterValue;
            if (filterType === 'location') return report.location.toLowerCase().includes(filterValue.toLowerCase());
            return true;
        });
    }, [sortedReports, filterType, filterValue]);


    const handleVote = async (e: React.MouseEvent, report: ExtendedIssue) => {
        e.stopPropagation(); 
        
        const user = auth.currentUser;
        if (!user) {
            alert("Please login to vote.");
            return;
        }

        if (user.uid === report.userId) {
            // Should be disabled in UI, but safe guard here
            return;
        }

        if (report.hasVoted) return; 

        // Optimistic Update
        setReports(prevReports => 
            prevReports.map(r => 
                r.id === report.id 
                ? { ...r, voteCount: (r.voteCount || 0) + 1, hasVoted: true } 
                : r
            )
        );

        try {
            await db.collection('reports').doc(String(report.id)).update({
                voteCount: firebase.firestore.FieldValue.increment(1),
                votedBy: firebase.firestore.FieldValue.arrayUnion(user.uid)
            });
        } catch (error) {
            console.error("Vote failed:", error);
            // Revert optimistic update
            setReports(prevReports => 
                prevReports.map(r => 
                    r.id === report.id 
                    ? { ...r, voteCount: (r.voteCount || 1) - 1, hasVoted: false } 
                    : r
                )
            );
        }
    };

    const applyLocationFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setFilterType('location');
        setFilterValue(tempLocationSearch);
        setIsFilterOpen(false);
    };

    const applyCategoryFilter = (category: string) => {
        setFilterType('category');
        setFilterValue(category);
        setIsFilterOpen(false);
    };
    
    const clearFilter = () => {
        setFilterType('none');
        setFilterValue('');
        setTempLocationSearch('');
        setIsFilterOpen(false);
    };

    return (
        <div className="absolute inset-0 pt-8 pb-24 px-4 md:px-8 z-10 animate-fadeIn pointer-events-auto">
            <style>{`
                @keyframes card-fade-in { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .animate-card-in { animation: card-fade-in 0.6s ease-out forwards; opacity: 0; }
                .custom-scrollbar-feed::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-feed::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-feed::-webkit-scrollbar-thumb { background: #8b5cf660; border-radius: 6px; }
                .custom-scrollbar-feed::-webkit-scrollbar-thumb:hover { background: #8b5cf690; }
                
                @keyframes pop-in { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .animate-pop-in { animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>
            
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 uppercase tracking-widest" style={{ textShadow: '0 0 8px #00ffff' }}>
                    Public Feed
                </h1>
                
                {/* Sorting Toggles */}
                <div className="flex justify-center mt-4 mb-2">
                    <div className="flex bg-black/40 backdrop-blur-md rounded-full border border-cyan-400/30 p-1 relative z-20">
                        <button
                            onClick={() => setSortMode('latest')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${sortMode === 'latest' ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'text-cyan-400 hover:bg-cyan-400/10'}`}
                        >
                            <ClockIcon />
                            Latest
                        </button>
                        <button
                            onClick={() => setSortMode('priority')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${sortMode === 'priority' ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'text-violet-400 hover:bg-violet-500/10'}`}
                        >
                            <FireIcon />
                            Top Priority
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Feed Area */}
            <div className="h-full overflow-y-auto custom-scrollbar-feed pr-2 -mr-2 pb-20">
                 {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <SpinnerIcon />
                        <p className="mt-4 text-cyan-300/70 uppercase tracking-wider text-sm">Syncing Global Grid...</p>
                    </div>
                 ) : error ? (
                     <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-red-500/30 bg-red-500/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-300 font-bold text-lg">{error}</p>
                        <p className="text-red-300/60 mt-2 text-sm">Please ensure Firestore rules allow public read access to the 'reports' collection.</p>
                     </div>
                 ) : displayedReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-dashed border-violet-500/30 bg-black/20 rounded-lg">
                        <p className="text-violet-300 text-lg">No records found.</p>
                        <p className="text-violet-300/50 text-sm mt-1">
                            {filterType !== 'none' ? 'Try adjusting your filters.' : 'No anomalies reported in the public sector.'}
                        </p>
                        {filterType !== 'none' && (
                             <button onClick={clearFilter} className="mt-4 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30 hover:bg-violet-500/40 transition-colors">
                                 Clear Filters
                             </button>
                        )}
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedReports.map((report, index) => {
                            // Check if current user is the reporter
                            const isOwnReport = auth.currentUser?.uid === report.userId;
                            
                            return (
                                <div 
                                    key={report.id}
                                    className={`text-left bg-[#0b0f1a]/80 backdrop-blur-xl rounded-lg border shadow-[0_0_20px_rgba(0,255,255,0.1)] p-4 group hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all duration-300 animate-card-in flex flex-col h-full relative ${sortMode === 'priority' ? 'border-violet-500/30 hover:border-violet-400/80' : 'border-cyan-400/30 hover:border-cyan-300/80'}`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div 
                                        className="w-full h-40 rounded-md overflow-hidden border-2 border-violet-500/30 mb-4 shrink-0 cursor-pointer"
                                        onClick={() => onViewDetails(report)}
                                    >
                                        <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full border border-violet-500/30">
                                            {report.category}
                                        </span>
                                        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full border ${getStatusStyles(report.status)}`}>
                                            <StatusIcon status={report.status} />
                                            {report.status}
                                        </span>
                                    </div>

                                    <h3 
                                        className="font-bold text-cyan-300 text-lg group-hover:text-cyan-200 transition-colors line-clamp-2 mb-auto cursor-pointer"
                                        onClick={() => onViewDetails(report)}
                                    >
                                        {report.title}
                                    </h3>
                                    <p className="text-xs text-violet-300/70 mt-1 truncate">
                                        <span className="opacity-60">📍</span> {report.location}
                                    </p>
                                    
                                    <div className="text-xs text-violet-300/60 mt-3 pt-3 border-t border-violet-500/10 flex justify-between items-center w-full">
                                        <div className="flex items-center gap-4">
                                             <span>{report.time}</span>
                                             <span>By: {report.reporter}</span>
                                        </div>
                                       
                                        {/* Vote Button */}
                                        <button 
                                            onClick={(e) => handleVote(e, report)}
                                            disabled={report.hasVoted || isOwnReport}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-300 
                                                ${report.hasVoted 
                                                    ? 'bg-cyan-500/20 border-cyan-400/50 cursor-default' 
                                                    : isOwnReport 
                                                        ? 'opacity-50 cursor-not-allowed border-transparent' 
                                                        : 'bg-transparent border-transparent hover:bg-white/5 hover:border-violet-500/30'}`}
                                            title={isOwnReport ? "You cannot vote on your own issue" : report.hasVoted ? "You have voted for this issue" : "Vote for this issue"}
                                        >
                                            <ThumbsUpIcon filled={report.hasVoted} />
                                            <span className={`font-bold ${report.hasVoted ? 'text-cyan-400' : 'text-violet-400'}`}>{report.voteCount || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 )}
            </div>

            {/* Filter UI */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
                {/* Active Filter Badge */}
                {filterType !== 'none' && !isFilterOpen && (
                    <div className="mb-3 flex items-center gap-2 bg-cyan-500/20 border border-cyan-400 px-4 py-2 rounded-full animate-pop-in">
                        <span className="text-sm text-cyan-300 font-bold uppercase">{filterType === 'location' ? 'Loc:' : 'Cat:'} {filterValue}</span>
                        <button onClick={clearFilter} className="text-cyan-400 hover:text-white"><CloseIcon /></button>
                    </div>
                )}

                {/* Filter Menu Popup */}
                {isFilterOpen && (
                    <div className="mb-6 w-96 bg-[#0b0f1a]/95 backdrop-blur-xl border border-violet-500/40 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.3)] overflow-hidden animate-pop-in">
                         {/* Main Menu */}
                         <div className="p-6 space-y-4">
                             <div className="px-3 py-2 text-lg font-bold text-violet-400 uppercase tracking-wider border-b border-violet-500/20 mb-2">
                                 Filter By
                             </div>
                             
                             {/* Category Section */}
                             <div className="p-2">
                                <div className="text-base text-violet-300 mb-3 flex items-center gap-2 font-medium"><TagIcon /> Category</div>
                                <div className="flex flex-wrap gap-3">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => applyCategoryFilter(cat)}
                                            className={`text-base px-4 py-2 rounded border ${filterType === 'category' && filterValue === cat ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300' : 'bg-black/40 border-violet-500/30 text-violet-300 hover:border-cyan-400 hover:text-cyan-300'} transition-all`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                             </div>

                             {/* Location Section */}
                             <div className="p-2 border-t border-violet-500/20 mt-4 pt-4">
                                <div className="text-base text-violet-300 mb-3 flex items-center gap-2 font-medium"><LocationIcon /> Location</div>
                                <form onSubmit={applyLocationFilter} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Enter area name..." 
                                        value={tempLocationSearch}
                                        onChange={(e) => setTempLocationSearch(e.target.value)}
                                        className="w-full bg-black/40 border border-violet-500/30 rounded px-4 py-3 text-base text-white focus:border-cyan-400 outline-none placeholder-violet-300/50"
                                    />
                                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded text-base font-bold">GO</button>
                                </form>
                             </div>

                             {/* Clear Option */}
                             {filterType !== 'none' && (
                                <button onClick={clearFilter} className="w-full text-center py-4 text-base text-red-400 hover:bg-red-500/10 transition-colors border-t border-violet-500/20 mt-2 font-medium">
                                    Reset Filters
                                </button>
                             )}
                         </div>
                    </div>
                )}

                {/* Main Filter Toggle Button */}
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-full border transition-all duration-300 shadow-lg ${isFilterOpen ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-black/40 backdrop-blur-lg border-violet-500/30 text-violet-300 hover:bg-black/60 hover:text-white hover:border-violet-500/60'}`}
                >
                    {isFilterOpen ? <CloseIcon /> : <FilterIcon />}
                    <span className="text-base font-bold uppercase tracking-wider">{isFilterOpen ? 'Close' : 'Filter Feed'}</span>
                </button>
            </div>
        </div>
    );
};

export default Feed;
