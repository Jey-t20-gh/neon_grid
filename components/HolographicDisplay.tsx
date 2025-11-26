import React, { useEffect } from 'react';
import { Issue } from './IssueDetailsPanel';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Rotating3DPlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center p-4">
        <div className="scene">
            <div className="cube">
                <div className="face front"></div>
                <div className="face back"></div>
                <div className="face right"></div>
                <div className="face left"></div>
                <div className="face top"></div>
                <div className="face bottom"></div>
            </div>
        </div>
    </div>
);

interface HolographicDisplayProps {
    issue: Issue | null;
    onClose: () => void;
}

const HolographicDisplay: React.FC<HolographicDisplayProps> = ({ issue, onClose }) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!issue) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="holographic-title"
        >
             <style>{`
                @keyframes holographic-fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-holographic-in { animation: holographic-fade-in 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }

                @keyframes scanline {
                    0% { transform: translateY(-10%); }
                    100% { transform: translateY(110%); }
                }
                .scanline::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(to bottom, rgba(0,255,255,0), rgba(0,255,255,0.5), rgba(0,255,255,0));
                    animation: scanline 4s linear infinite;
                    opacity: 0.6;
                }
                
                .scene { width: 150px; height: 150px; perspective: 400px; }
                .cube { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; animation: rotate-cube 20s infinite linear; }
                .face {
                    position: absolute;
                    width: 150px;
                    height: 150px;
                    border: 1px solid rgba(0, 255, 255, 0.5);
                    background: rgba(0, 255, 255, 0.05);
                }
                .front  { transform: rotateY(0deg) translateZ(75px); }
                .back   { transform: rotateY(180deg) translateZ(75px); }
                .right  { transform: rotateY(90deg) translateZ(75px); }
                .left   { transform: rotateY(-90deg) translateZ(75px); }
                .top    { transform: rotateX(90deg) translateZ(75px); }
                .bottom { transform: rotateX(-90deg) translateZ(75px); }
                
                @keyframes rotate-cube {
                    from { transform: rotateX(0deg) rotateY(0deg); }
                    to { transform: rotateX(360deg) rotateY(360deg); }
                }
            `}</style>
            
            <div className="relative w-full max-w-6xl h-[80vh] flex flex-col lg:flex-row gap-4 animate-holographic-in">
                {/* Left Panel: Issue Details */}
                <div className="relative w-full lg:w-1/2 h-full bg-[#0b0f1a]/80 backdrop-blur-md rounded-lg border border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] p-6 overflow-hidden scanline">
                     <div className="flex items-center justify-between pb-4 border-b border-cyan-400/20">
                        <h2 id="holographic-title" className="text-2xl font-bold text-cyan-400 uppercase tracking-wider" style={{ textShadow: '0 0 4px #00ffff' }}>
                            Anomaly Details
                        </h2>
                     </div>
                     <div className="mt-6 h-[calc(100%-60px)] overflow-y-auto pr-4 -mr-4">
                        <h3 className="text-3xl font-bold text-cyan-300 mb-2">{issue.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-violet-300 mb-4">
                            <span>ID: <span className="font-mono text-white">NG-{issue.id.toString().padStart(4, '0')}</span></span>
                            <span>Status: <span className="font-bold text-yellow-300">{issue.status}</span></span>
                             <span>Category: <span className="text-white">{issue.category}</span></span>
                            <span>Date: <span className="text-white">{issue.date}</span></span>
                        </div>
                        <p className="text-violet-200 leading-relaxed">{issue.description}</p>
                        <img src={issue.imageUrl} alt={issue.title} className="w-full h-48 object-cover rounded-md border-2 border-violet-500/30 mt-4" />
                     </div>
                </div>

                {/* Right Panel: 3D Model */}
                <div className="relative w-full lg:w-1/2 h-full bg-[#0b0f1a]/80 backdrop-blur-md rounded-lg border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)] p-6 overflow-hidden scanline">
                    <div className="flex items-center justify-between pb-4 border-b border-violet-500/20">
                        <h2 className="text-2xl font-bold text-violet-400 uppercase tracking-wider" style={{ textShadow: '0 0 4px #8b5cf6' }}>
                            Region Scan
                        </h2>
                    </div>
                     <div className="mt-6 h-[calc(100%-60px)] flex flex-col items-center justify-center">
                        <Rotating3DPlaceholder />
                        <p className="text-violet-300/70 text-sm mt-4 text-center">Auto-rotating 3D model placeholder.<br/>Live regional data stream pending.</p>
                     </div>
                </div>
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute -top-3 -right-3 p-2 rounded-full bg-cyan-500/80 text-black hover:bg-cyan-300 transition-colors z-10 shadow-lg"
                    aria-label="Close holographic display"
                >
                    <CloseIcon />
                </button>
            </div>
        </div>
    );
};

export default HolographicDisplay;
