
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { auth, db } from './firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const TagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a1 1 0 011-1h5a1 1 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);
const ThumbsUpIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-all duration-300 ${filled ? 'text-cyan-400 fill-cyan-400' : 'text-violet-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
    </svg>
);
const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
);

// Re-using StatusIcon and getStatusStyles logic
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

export interface Issue {
  id: number | string;
  title: string;
  category: string;
  status: string;
  date: string;
  imageUrl: string;
  description: string;
  location?: string;
  voteCount?: number;
  votedBy?: string[];
  userId?: string;
  coordinates?: { lat: number; lng: number };
}

interface Comment {
    id: string;
    text: string;
    userId: string;
    username: string;
    createdAt: any;
}

interface IssueDetailsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    issue: Issue | null;
}

const IssueDetailsPanel: React.FC<IssueDetailsPanelProps> = ({ isOpen, onClose, issue }) => {
    const [currentStatus, setCurrentStatus] = useState(issue?.status);
    const [voteCount, setVoteCount] = useState(0);
    const [hasVoted, setHasVoted] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    
    // Chat States
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (issue) {
            setCurrentStatus(issue.status);
            setVoteCount(issue.voteCount || 0);
            const user = auth.currentUser;
            if (user && issue.votedBy && issue.votedBy.includes(user.uid)) {
                setHasVoted(true);
            } else {
                setHasVoted(false);
            }

            // Real-time listener for comments
            const unsubscribeComments = db.collection('reports')
                .doc(String(issue.id))
                .collection('comments')
                .orderBy('createdAt', 'asc')
                .onSnapshot(snapshot => {
                    const fetchedComments = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Comment));
                    setComments(fetchedComments);
                }, err => {
                    console.error("Error fetching comments", err);
                });

            return () => unsubscribeComments();
        }
    }, [issue]);

    // Calculate Predicted Resolution Time
    const prediction = useMemo(() => {
        if (!issue) return null;
        
        // Base days for resolution by category (Mock Data)
        const baseLine: Record<string, number> = {
            'Road': 14,
            'Garbage': 3,
            'Water': 2,
            'Electricity': 1,
            'Infrastructure': 20,
            'Other': 7
        };
        
        const baseDays = baseLine[issue.category] || 7;
        const votes = voteCount || 0;
        
        // Reduction Logic: More votes = Faster response
        // Capped at 50% reduction to remain realistic
        const reductionDays = Math.min(baseDays * 0.5, Math.floor(votes / 5));
        
        const estimatedDays = Math.max(1, Math.round(baseDays - reductionDays));
        const maxEstimatedDays = estimatedDays + 2;
        
        // Mocking historical data count
        const similarCases = 120 + Math.floor(Math.random() * 300);
        const confidence = 82 + Math.floor(Math.random() * 14); // 82% - 96%
        
        return {
            min: estimatedDays,
            max: maxEstimatedDays,
            similarCases,
            confidence
        };
    }, [issue?.category, voteCount]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !issue) return null;

    const handleMarkAsResolved = () => {
        setCurrentStatus('Resolved');
        // In a real app, update Firestore status here
    };

    const handleVote = async () => {
        const user = auth.currentUser;
        if (!user || hasVoted || isVoting) return;

        setIsVoting(true);
        
        try {
            // Optimistic UI update
            setVoteCount(prev => prev + 1);
            setHasVoted(true);

            await db.collection('reports').doc(String(issue.id)).update({
                voteCount: firebase.firestore.FieldValue.increment(1),
                votedBy: firebase.firestore.FieldValue.arrayUnion(user.uid)
            });
        } catch (error) {
            console.error("Error voting:", error);
            // Revert optimistic update
            setVoteCount(prev => prev - 1);
            setHasVoted(false);
        } finally {
            setIsVoting(false);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user || !newComment.trim()) return;

        setIsSending(true);
        try {
            // Fetch user profile to get current username
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            const username = userData?.username || user.email?.split('@')[0] || 'Anonymous';

            await db.collection('reports').doc(String(issue.id)).collection('comments').add({
                text: newComment.trim(),
                userId: user.uid,
                username: username,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            setNewComment('');
        } catch (error) {
            console.error("Error posting comment:", error);
            alert("Failed to transmit message.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issue-details-title"
        >
            <style>{`
                @keyframes panel-fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-panel-in {
                    animation: panel-fade-in 0.3s ease-out forwards;
                }
                .custom-scrollbar-details::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-details::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-details::-webkit-scrollbar-thumb { background: #8b5cf660; border-radius: 4px; }
                .custom-scrollbar-details::-webkit-scrollbar-thumb:hover { background: #8b5cf690; }
            `}</style>
            
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row bg-[#0b0f1a]/95 backdrop-blur-lg rounded-2xl border border-cyan-400/50 shadow-[0_0_30px_rgba(0,255,255,0.2)] text-white overflow-hidden animate-panel-in">
                
                {/* Close Button Mobile (Absolute) */}
                <button onClick={onClose} className="md:hidden absolute top-4 right-4 p-2 rounded-full text-cyan-400 bg-black/50 z-20" aria-label="Close panel">
                    <CloseIcon />
                </button>

                {/* Left Side: Issue Details (Scrollable) */}
                <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto custom-scrollbar-details border-b md:border-b-0 md:border-r border-cyan-400/20">
                    <div className="hidden md:flex items-center justify-between pb-4 border-b border-cyan-400/20">
                        <h2 id="issue-details-title" className="text-xl md:text-2xl font-bold text-cyan-400 uppercase tracking-wider" style={{ textShadow: '0 0 4px #00ffff' }}>
                            Issue Details
                        </h2>
                    </div>

                    <div className="mt-6">
                        <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden border-2 border-violet-500/30 mb-6 relative group">
                            <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 right-4">
                                 <button 
                                    onClick={handleVote}
                                    disabled={hasVoted || isVoting}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300 ${hasVoted ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.4)]' : 'bg-black/40 border-violet-500/50 hover:bg-black/60 hover:border-cyan-400/80'}`}
                                >
                                    <ThumbsUpIcon filled={hasVoted} />
                                    <span className={`font-bold text-lg ${hasVoted ? 'text-cyan-400' : 'text-white'}`}>{voteCount}</span>
                                    <span className="text-xs uppercase tracking-wider ml-1 text-violet-300">Priority</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-cyan-300">{issue.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-violet-300/80">
                                <span className={`flex items-center text-sm font-bold px-3 py-1.5 rounded-full border ${getStatusStyles(currentStatus || issue.status)}`}>
                                    <StatusIcon status={currentStatus || issue.status} />
                                    {currentStatus || issue.status}
                                </span>
                                <span className="flex items-center gap-2 text-sm"><TagIcon /> {issue.category}</span>
                                <span className="flex items-center gap-2 text-sm"><CalendarIcon /> {issue.date}</span>
                            </div>
                        </div>

                        {/* AI Resolution Prediction Card */}
                        {currentStatus !== 'Resolved' && prediction && (
                            <div className="mt-6 bg-cyan-900/10 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2 mb-1">
                                            <TrendingUpIcon /> AI Resolution Forecast
                                        </h4>
                                        <p className="text-violet-200 text-sm">
                                            Estimated Resolution: <span className="text-white font-bold text-base">{prediction.min} - {prediction.max} Days</span>
                                        </p>
                                        <p className="text-violet-300/50 text-xs mt-1">
                                            Analysis based on {prediction.similarCases} historical authority actions for <b>{issue.category}</b>.
                                            High priority status ({voteCount} votes) factored in.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-cyan-300 font-mono text-xl font-bold">
                                            {prediction.confidence}% <SparklesIcon />
                                        </div>
                                        <span className="text-xs text-cyan-400/50 uppercase tracking-wider">Confidence</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <p className="text-violet-200 leading-relaxed">{issue.description}</p>
                        </div>

                        <div className="mt-6 p-4 bg-black/30 rounded-md border border-violet-500/20 flex items-center gap-3">
                            <MapPinIcon />
                            <span className="text-violet-300/70 italic">
                                {issue.location || "Location data not available"}
                            </span>
                            {issue.coordinates && (
                                <span className="text-cyan-400/70 text-xs ml-auto font-mono">
                                    {issue.coordinates.lat.toFixed(4)}, {issue.coordinates.lng.toFixed(4)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-cyan-400/20 flex flex-col sm:flex-row gap-4">
                         <button
                            onClick={handleMarkAsResolved}
                            disabled={currentStatus === 'Resolved'}
                            className="flex-1 px-4 py-3 bg-green-500/20 border-2 border-green-400 rounded-lg text-green-300 font-bold uppercase tracking-widest hover:bg-green-400 hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500/20 disabled:hover:text-green-300"
                        >
                            Mark as Resolved
                        </button>
                        <button 
                            onClick={onClose}
                            className="hidden md:block flex-1 px-4 py-3 bg-violet-500/10 border-2 border-violet-500 rounded-lg text-violet-300 font-bold uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all duration-300"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Right Side: Chat / Comms */}
                <div className="w-full md:w-2/5 flex flex-col h-[500px] md:h-auto bg-black/20">
                    <div className="p-4 bg-black/40 border-b border-violet-500/20 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-violet-300 font-bold uppercase tracking-wider text-sm">
                             <ChatIcon /> Live Comms Channel
                         </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-details space-y-4">
                        {comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-violet-300/40">
                                <p className="text-sm">No transmissions intercepted.</p>
                                <p className="text-xs mt-1">Be the first to establish contact.</p>
                            </div>
                        ) : (
                            comments.map((comment) => {
                                const isMe = auth.currentUser?.uid === comment.userId;
                                return (
                                    <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm border ${
                                            isMe 
                                            ? 'bg-cyan-900/30 border-cyan-500/40 text-cyan-100 rounded-br-none' 
                                            : 'bg-violet-900/30 border-violet-500/40 text-violet-100 rounded-bl-none'
                                        }`}>
                                            <p className="font-bold text-xs mb-1 opacity-70 flex justify-between gap-4">
                                                <span>{comment.username}</span>
                                            </p>
                                            <p>{comment.text}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handlePostComment} className="p-4 bg-black/40 border-t border-violet-500/20 flex gap-2">
                        <input 
                            type="text" 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={auth.currentUser ? "Enter message..." : "Login to transmit"}
                            disabled={!auth.currentUser || isSending}
                            className="flex-1 bg-black/50 border border-violet-500/30 rounded-md px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none placeholder-violet-300/30 transition-colors"
                        />
                        <button 
                            type="submit"
                            disabled={!auth.currentUser || isSending || !newComment.trim()}
                            className="p-2 bg-cyan-500/20 border border-cyan-400 rounded-md text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Transmit Message"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default IssueDetailsPanel;
