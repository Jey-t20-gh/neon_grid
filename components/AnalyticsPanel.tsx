
import React, { useEffect, useState } from 'react';

// Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrendUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

// Mock Data
const mockStats = {
  total: 124,
  resolved: 89,
  pending: 35,
  efficiency: 72, // Percentage
  categoryData: [
    { name: "Road", value: 45, color: "#00ffff" },       // Cyan
    { name: "Waste", value: 30, color: "#8b5cf6" },      // Violet
    { name: "Water", value: 25, color: "#ec4899" },      // Pink
    { name: "Power", value: 24, color: "#f59e0b" }       // Amber
  ],
  monthlyData: [
    { month: "Aug", reports: 23 },
    { month: "Sep", reports: 31 },
    { month: "Oct", reports: 45 },
    { month: "Nov", reports: 17 },
    { month: "Dec", reports: 58 },
    { month: "Jan", reports: 39 }
  ]
};

// Custom Holographic Donut Chart
const DonutChart = ({ data, onHover }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let cumulative = 0;
    const strokeWidth = 0.15;
    const gap = 0.02; // Gap between slices

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="relative w-full h-full">
            <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
                <defs>
                    <filter id="glow-donut" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="0.05" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Outer Rotating Ring */}
                <circle cx="0" cy="0" r="1.1" fill="none" stroke="#8b5cf6" strokeWidth="0.01" strokeDasharray="0.1 0.1" opacity="0.5">
                    <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="1.15" fill="none" stroke="#00ffff" strokeWidth="0.005" strokeDasharray="0.2 0.4" opacity="0.3">
                    <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="30s" repeatCount="indefinite" />
                </circle>

                {data.map((slice, index) => {
                    const startPercent = cumulative / total;
                    const endPercent = ((cumulative + slice.value) / total) - gap;
                    cumulative += slice.value;

                    // Skip if slice is too small after gap
                    if (endPercent <= startPercent) return null;

                    const [startX, startY] = getCoordinatesForPercent(startPercent);
                    const [endX, endY] = getCoordinatesForPercent(endPercent);

                    const largeArcFlag = (endPercent - startPercent) > .5 ? 1 : 0;
                    
                    const pathData = [
                        `M ${startX * (1 - strokeWidth)} ${startY * (1 - strokeWidth)}`,
                        `A ${1-strokeWidth} ${1-strokeWidth} 0 ${largeArcFlag} 1 ${endX * (1 - strokeWidth)} ${endY * (1 - strokeWidth)}`,
                        `L ${endX} ${endY}`,
                        `A 1 1 0 ${largeArcFlag} 0 ${startX} ${startY}`,
                        `Z`
                    ].join(' ');

                    return (
                        <path 
                            key={index} 
                            d={pathData} 
                            fill={slice.color}
                            filter="url(#glow-donut)"
                            className="transition-all duration-300 cursor-pointer hover:opacity-100 opacity-80"
                            onMouseEnter={() => onHover(slice)}
                            onMouseLeave={() => onHover(null)}
                            style={{ transformOrigin: '0 0' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    );
                })}
            </svg>
            
            {/* Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-24 h-24 rounded-full border border-cyan-400/20 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                     {/* Content injected via parent state to keep this component pure-ish SVG */}
                </div>
            </div>
        </div>
    );
};


// Custom Neon Bar Chart
const BarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.reports));
    
    return (
        <div className="w-full h-full relative p-2">
            {/* Background Grid */}
            <div className="absolute inset-0 flex flex-col justify-between px-2 py-6 opacity-20 pointer-events-none">
                <div className="w-full h-px bg-cyan-400"></div>
                <div className="w-full h-px bg-cyan-400"></div>
                <div className="w-full h-px bg-cyan-400"></div>
                <div className="w-full h-px bg-cyan-400"></div>
                <div className="w-full h-px bg-cyan-400"></div>
            </div>

            <div className="w-full h-full flex justify-around items-end gap-2 relative z-10">
                {data.map((item, index) => {
                    const heightPercent = (item.reports / maxValue) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                             {/* Tooltip */}
                            <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-black/80 border border-cyan-400/50 text-cyan-300 text-xs px-2 py-1 rounded">
                                {item.reports}
                            </div>
                            
                            {/* Bar */}
                            <div className="w-full max-w-[30px] h-full flex flex-col justify-end relative">
                                <div 
                                    className="w-full bg-gradient-to-t from-violet-900/50 to-cyan-400/80 rounded-t-sm transition-all duration-700 ease-out group-hover:to-cyan-300 group-hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                                    style={{ height: `${heightPercent}%` }}
                                >
                                    {/* Scanline effect on bar */}
                                    <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
                                </div>
                                {/* Reflection */}
                                <div 
                                    className="w-full bg-gradient-to-b from-cyan-400/20 to-transparent absolute top-full left-0 transform scale-y-[-0.5] opacity-30 blur-[2px]"
                                    style={{ height: `${heightPercent * 0.3}%` }}
                                ></div>
                            </div>

                            <div className="text-[10px] text-violet-300/70 mt-3 uppercase tracking-wider">{item.month}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


interface AnalyticsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ isOpen, onClose }) => {
    const [hoveredSlice, setHoveredSlice] = useState(null);

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
    
    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="analytics-title"
        >
             <style>{`
                @keyframes panel-zoom {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-panel-zoom {
                    animation: panel-zoom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .custom-scrollbar-analytics::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-analytics::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-analytics::-webkit-scrollbar-thumb { background: #00ffff40; border-radius: 4px; }
            `}</style>
            
            <div className="relative w-full max-w-5xl bg-[#0b0f1a]/95 backdrop-blur-xl rounded-2xl border border-cyan-400/40 shadow-[0_0_50px_rgba(0,255,255,0.15)] text-white p-6 md:p-8 animate-panel-zoom overflow-hidden">
                
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400 rounded-br-xl pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-cyan-400/20 mb-6">
                    <div>
                        <h2 id="analytics-title" className="text-3xl font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                            <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#00ffff]"></span>
                            System Analytics
                        </h2>
                        <p className="text-violet-400 text-xs uppercase tracking-widest mt-1 ml-6">Real-time Urban Data Visualization</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400 hover:text-black transition-all duration-300"
                        aria-label="Close panel"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Content Area */}
                <div className="max-h-[75vh] overflow-y-auto custom-scrollbar-analytics pr-2">
                    
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {/* Total */}
                        <div className="bg-black/40 border border-cyan-400/30 p-4 rounded-lg relative overflow-hidden group hover:border-cyan-400 transition-colors">
                            <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                            </div>
                            <div className="text-violet-300 text-xs uppercase tracking-widest mb-1">Total Reports</div>
                            <div className="text-3xl font-black text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>{mockStats.total}</div>
                            <div className="mt-2 h-1 w-full bg-cyan-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 w-full shadow-[0_0_10px_#00ffff]"></div>
                            </div>
                        </div>

                        {/* Resolved */}
                        <div className="bg-black/40 border border-green-500/30 p-4 rounded-lg relative overflow-hidden group hover:border-green-400 transition-colors">
                            <div className="text-green-300 text-xs uppercase tracking-widest mb-1">Resolved</div>
                            <div className="text-3xl font-black text-white flex items-end gap-2">
                                {mockStats.resolved}
                                <span className="text-xs text-green-400 font-bold mb-1 flex items-center"><TrendUpIcon /> +12%</span>
                            </div>
                            <div className="mt-2 h-1 w-full bg-green-900 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 w-[70%] shadow-[0_0_10px_#4ade80]"></div>
                            </div>
                        </div>

                        {/* Pending */}
                        <div className="bg-black/40 border border-yellow-500/30 p-4 rounded-lg relative overflow-hidden group hover:border-yellow-400 transition-colors">
                            <div className="text-yellow-300 text-xs uppercase tracking-widest mb-1">Pending</div>
                            <div className="text-3xl font-black text-white">{mockStats.pending}</div>
                            <div className="mt-2 h-1 w-full bg-yellow-900 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 w-[30%] shadow-[0_0_10px_#facc15]"></div>
                            </div>
                        </div>

                        {/* Efficiency */}
                        <div className="bg-black/40 border border-violet-500/30 p-4 rounded-lg relative overflow-hidden group hover:border-violet-400 transition-colors">
                            <div className="text-violet-300 text-xs uppercase tracking-widest mb-1">Efficiency Rate</div>
                            <div className="text-3xl font-black text-white">{mockStats.efficiency}%</div>
                            <div className="mt-2 h-1 w-full bg-violet-900 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-400 w-[72%] shadow-[0_0_10px_#a78bfa]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                        {/* Donut Chart Section (5 cols) */}
                        <div className="lg:col-span-5 flex flex-col">
                             <div className="bg-black/20 border border-cyan-400/20 rounded-xl p-6 h-full flex flex-col items-center justify-center relative shadow-inner shadow-cyan-900/20">
                                <h3 className="absolute top-4 left-6 font-bold text-cyan-300 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                                    Category Distribution
                                </h3>
                                
                                <div className="w-64 h-64 mt-4 relative">
                                     <DonutChart data={mockStats.categoryData} onHover={setHoveredSlice} />
                                     
                                     {/* Center Text Overlay */}
                                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        {hoveredSlice ? (
                                            <>
                                                <div className="text-4xl font-black" style={{color: hoveredSlice.color, textShadow: `0 0 10px ${hoveredSlice.color}`}}>{hoveredSlice.value}</div>
                                                <div className="text-xs uppercase tracking-widest text-white mt-1">{hoveredSlice.name}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-4xl font-black text-cyan-400" style={{textShadow: '0 0 15px rgba(0,255,255,0.6)'}}>{mockStats.total}</div>
                                                <div className="text-[10px] uppercase tracking-widest text-violet-300 mt-1">Total Reports</div>
                                            </>
                                        )}
                                     </div>
                                </div>

                                {/* Legend */}
                                <div className="w-full grid grid-cols-2 gap-2 mt-6">
                                    {mockStats.categoryData.map(item => (
                                        <div key={item.name} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-white/5 hover:border-white/20 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: item.color, color: item.color }}></span>
                                                <span className="text-xs text-violet-200">{item.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-white">{((item.value / mockStats.total) * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>

                        {/* Bar Chart Section (7 cols) */}
                        <div className="lg:col-span-7 flex flex-col">
                            <div className="bg-black/20 border border-violet-500/20 rounded-xl p-6 h-full flex flex-col relative shadow-inner shadow-violet-900/20">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="font-bold text-violet-300 text-sm uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                                        Report Volume (6 Months)
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded bg-violet-500/10 border border-violet-500/30 text-[10px] text-violet-300 uppercase">Monthly</span>
                                        <span className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] text-gray-500 uppercase">Weekly</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-h-[200px] w-full">
                                    <BarChart data={mockStats.monthlyData} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer / System Status */}
                    <div className="mt-6 flex items-center justify-between text-[10px] text-cyan-900 uppercase tracking-widest border-t border-cyan-900/30 pt-4">
                        <div className="flex gap-4">
                            <span>System Status: <span className="text-green-500">ONLINE</span></span>
                            <span>Data Sync: <span className="text-cyan-600">AUTO</span></span>
                        </div>
                        <div className="font-mono">ID: N-GRID-ANALYTICS-V4.2</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
