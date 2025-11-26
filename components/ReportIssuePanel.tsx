
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { GoogleGenAI } from "@google/genai";

// Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
);

// Helper for Haversine distance
const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Distance in meters
}

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
}

interface ReportIssuePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReportIssuePanel: React.FC<ReportIssuePanelProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Road');
    const [useLocation, setUseLocation] = useState(true);
    const [fileName, setFileName] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('✅ Issue reported successfully!');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [aiDetected, setAiDetected] = useState(false);
    
    // Geocoding States
    const [manualCoordinates, setManualCoordinates] = useState<{lat: number, lng: number} | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Detect mobile device on mount
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            const isSmallScreen = window.innerWidth <= 768;
            setIsMobile(isMobileDevice || isSmallScreen);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Helper to geocode address
    const geocodeAddress = async (address: string) => {
        if (!address.trim()) return null;
        setIsGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const coords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                setManualCoordinates(coords);
                return coords;
            } else {
                return null;
            }
        } catch (e) {
            console.error("Geocoding failed", e);
            return null;
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleManualGeocodeClick = async () => {
        const coords = await geocodeAddress(location);
        if (!coords) {
            alert("Could not find coordinates for this location. Please try a more specific address.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to report an issue.");
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('✅ Issue reported successfully!');

        try {
            // Use the uploaded image (Base64) if available, otherwise use a random seed
            const imageToSave = selectedImage || `https://picsum.photos/seed/${Date.now()}/800/600`;

            let coordinates = null;
            
            if (useLocation) {
                // Option A: GPS
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                    });
                    coordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                } catch (error) {
                    console.warn("Could not get location", error);
                    alert("Could not retrieve GPS location. Submitting without coordinates.");
                }
            } else {
                // Option B: Manual Input
                if (manualCoordinates) {
                    coordinates = manualCoordinates;
                } else if (location.trim()) {
                    // Try to geocode one last time if user didn't click the search button
                    coordinates = await geocodeAddress(location);
                    if (!coordinates) {
                        // Confirm with user if they want to proceed without map marker
                        const proceed = window.confirm("We couldn't auto-detect coordinates for this address. The report won't appear on the map. Proceed anyway?");
                        if (!proceed) {
                            setIsSubmitting(false);
                            return;
                        }
                    }
                }
            }

            // --- DUPLICATE DETECTION LOGIC ---
            if (coordinates) {
                // Fetch potential duplicates (Same status, we will check category and distance client-side)
                const snapshot = await db.collection('reports')
                    .where('status', 'in', ['Open', 'In Progress'])
                    .get();
                
                let duplicateIssue: any = null;
                
                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    // Check strict category match and distance < 30m
                    if (data.coordinates && data.category === category) {
                        const dist = getDistanceFromLatLonInMeters(
                            coordinates.lat, coordinates.lng,
                            data.coordinates.lat, data.coordinates.lng
                        );
                        
                        if (dist < 30) { 
                            duplicateIssue = { id: doc.id, ...data };
                            break;
                        }
                    }
                }
                
                if (duplicateIssue) {
                    // Check if user has already voted
                    const hasVoted = duplicateIssue.votedBy && duplicateIssue.votedBy.includes(user.uid);
                    
                    if (!hasVoted) {
                        await db.collection('reports').doc(duplicateIssue.id).update({
                            voteCount: firebase.firestore.FieldValue.increment(1),
                            votedBy: firebase.firestore.FieldValue.arrayUnion(user.uid)
                        });
                        setSuccessMessage('⚡ Similar issue nearby! Auto-upvoted existing report.');
                    } else {
                        setSuccessMessage('⚠️ Issue already reported nearby (You have voted).');
                    }
                    
                    setShowSuccess(true);
                    setTimeout(() => {
                        setShowSuccess(false);
                        onClose();
                        resetForm();
                    }, 3000);
                    
                    setIsSubmitting(false);
                    return; // EXIT early, do not create new report
                }
            }
            // --------------------------------

            // Create the report object
            const newReport = {
                userId: user.uid,
                title,
                location,
                description,
                category,
                status: 'Open',
                imageUrl: imageToSave,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                voteCount: 0,
                votedBy: [],
                coordinates: coordinates
            };

            await db.collection('reports').add(newReport);

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
                resetForm();
            }, 2500);

        } catch (error: any) {
            console.error("Error reporting issue:", error);
            if (error.code === 'permission-denied') {
                alert("Permission denied. Please check your Firestore Security Rules.");
            } else if (error.code === 'invalid-argument' && error.message.includes('document is larger than')) {
                 alert("Image too large. Please try a smaller image.");
            } else {
                alert("Failed to submit report. Please try again.");
            }
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTimeout(() => {
            setTitle('');
            setLocation('');
            setDescription('');
            setCategory('Road');
            setUseLocation(true);
            setFileName('');
            setSelectedImage(null);
            setManualCoordinates(null);
            setIsSubmitting(false);
            setAiDetected(false);
            setSuccessMessage('✅ Issue reported successfully!');
        }, 500);
    };

    const classifyImage = async (base64String: string) => {
        setIsAnalyzingImage(true);
        setAiDetected(false);
        try {
            // Remove data url prefix to get raw base64
            const match = base64String.match(/^data:(.+);base64,(.+)$/);
            if (!match) return;
            
            const mimeType = match[1];
            const data = match[2];

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType, data } },
                        { text: "Analyze this image of a civic issue. Classify it strictly into one of these categories: 'Road', 'Garbage', 'Water', 'Electricity', 'Infrastructure', 'Other'. Return ONLY the category name. If unsure, return 'Other'." }
                    ]
                }
            });

            const detectedCategory = response.text.trim();
            const validCategories = ['Road', 'Garbage', 'Water', 'Electricity', 'Infrastructure', 'Other'];
            
            if (validCategories.includes(detectedCategory)) {
                setCategory(detectedCategory);
                setAiDetected(true);
            }

        } catch (error) {
            console.error("AI Classification Error:", error);
        } finally {
            setIsAnalyzingImage(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Basic size check (Firestore doc limit is 1MB, keep it safe at 800KB)
            if (file.size > 800 * 1024) {
                alert("File is too large. Please select an image under 800KB.");
                return;
            }

            setFileName(file.name);
            
            // Read file as Data URL (Base64)
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSelectedImage(result);
                // Trigger AI classification
                classifyImage(result);
            };
            reader.readAsDataURL(file);
        } else {
            setFileName('');
            setSelectedImage(null);
            setAiDetected(false);
        }
    };

    const removeImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFileName('');
        setSelectedImage(null);
        setAiDetected(false);
    };

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Reset manual coordinates if user changes text after fetching
    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocation(e.target.value);
        if (manualCoordinates) {
            setManualCoordinates(null);
        }
    };

    return (
        <div 
            className={`fixed top-0 left-0 h-full w-full max-w-md bg-[#0b0f1a]/85 backdrop-blur-md p-6 text-white border-r border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-transform duration-500 ease-in-out z-50
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-issue-title"
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyan-400/20">
                <h2 id="report-issue-title" className="text-2xl font-bold text-cyan-400 uppercase tracking-wider" style={{ textShadow: '0 0 4px #00ffff' }}>
                    Report a Civic Issue
                </h2>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                    aria-label="Close panel"
                >
                    <CloseIcon />
                </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto h-[calc(100%-160px)] mt-6 pr-3 -mr-3">
                 <form id="report-issue-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Issue Title */}
                    <div>
                        <label htmlFor="issue-title" className="block text-sm font-medium text-violet-300 uppercase tracking-wider mb-2">Issue Title</label>
                        <input 
                            type="text" 
                            id="issue-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-black/30 border border-violet-500/30 rounded-md p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                            placeholder="e.g., Large pothole on Main St."
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="category" className="block text-sm font-medium text-violet-300 uppercase tracking-wider">Category</label>
                             {isAnalyzingImage && (
                                 <span className="text-xs text-cyan-400 flex items-center animate-pulse font-bold">
                                     <SparklesIcon /> AI Analyzing...
                                 </span>
                             )}
                             {aiDetected && !isAnalyzingImage && (
                                 <span className="text-xs text-green-400 flex items-center font-bold">
                                     <SparklesIcon /> AI Auto-Detected
                                 </span>
                             )}
                        </div>
                        <select 
                            id="category"
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setAiDetected(false); // Clear AI tag if user manually overrides
                            }}
                            className={`w-full bg-black/30 border rounded-md p-3 focus:ring-2 focus:ring-cyan-400 outline-none transition-all appearance-none bg-no-repeat bg-right pr-8 
                                ${aiDetected ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'border-violet-500/30 focus:border-cyan-400'}`}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238b5cf6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                        >
                            <option>Road</option>
                            <option>Garbage</option>
                            <option>Water</option>
                            <option>Electricity</option>
                            <option>Infrastructure</option>
                            <option>Other</option>
                        </select>
                    </div>

                    {/* Location Input with Manual Geocode Toggle */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                             <label htmlFor="location" className="block text-sm font-medium text-violet-300 uppercase tracking-wider">Location / Address</label>
                             <div className="flex items-center">
                                <span className={`text-xs mr-2 transition-colors ${useLocation ? 'text-cyan-400 font-bold' : 'text-gray-500'}`}>Use GPS</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseLocation(!useLocation);
                                        // Clear manual coords if switching back to GPS
                                        if (!useLocation) setManualCoordinates(null);
                                    }}
                                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-cyan-400 ${useLocation ? 'bg-cyan-500' : 'bg-gray-600'}`}
                                    role="switch"
                                    aria-checked={useLocation}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useLocation ? 'translate-x-4' : 'translate-x-0'}`}></span>
                                </button>
                             </div>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                id="location"
                                value={location}
                                onChange={handleLocationChange}
                                required
                                disabled={useLocation}
                                className={`w-full bg-black/30 border rounded-md p-3 outline-none transition-all ${useLocation ? 'text-gray-400 border-gray-700 cursor-not-allowed' : 'text-white border-violet-500/30 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400'}`}
                                placeholder={useLocation ? "Fetching GPS coordinates..." : "Enter location manually..."}
                            />
                            {!useLocation && (
                                <button
                                    type="button"
                                    onClick={handleManualGeocodeClick}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-400 hover:text-white bg-black/50 rounded-full hover:bg-cyan-500/50 transition-all"
                                    title="Find coordinates for this address"
                                >
                                    {isGeocoding ? <SpinnerIcon /> : <SearchIcon />}
                                </button>
                            )}
                        </div>
                        {/* Status Message for Manual Coords */}
                        {!useLocation && manualCoordinates && (
                            <div className="mt-2 text-xs flex items-center text-green-400 animate-pulse">
                                <CheckIcon />
                                <span>Coordinates locked: {manualCoordinates.lat.toFixed(5)}, {manualCoordinates.lng.toFixed(5)}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-violet-300 uppercase tracking-wider mb-2">Description / Context</label>
                        <textarea 
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            className="w-full bg-black/30 border border-violet-500/30 rounded-md p-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                            placeholder="Provide details about the issue..."
                        ></textarea>
                    </div>

                    {/* Attach Image */}
                    <div>
                        <label className="block text-sm font-medium text-violet-300 uppercase tracking-wider mb-2">Attach Image</label>
                        
                        {/* Mobile Camera Option */}
                        {isMobile && !selectedImage && (
                             <div className="mb-3">
                                <input 
                                    type="file" 
                                    id="camera-input" 
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />
                                <label 
                                    htmlFor="camera-input" 
                                    className="flex items-center justify-center w-full gap-2 bg-cyan-500/10 border border-cyan-400 rounded-md p-4 text-cyan-400 font-bold uppercase tracking-wider cursor-pointer hover:bg-cyan-400 hover:text-black transition-all"
                                >
                                    <CameraIcon />
                                    Take Photo
                                </label>
                            </div>
                        )}

                        <div className="relative">
                            {!selectedImage ? (
                                <>
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                    <label htmlFor="file-upload" className="flex items-center justify-center w-full bg-black/30 border-2 border-dashed border-violet-500/50 rounded-md p-4 text-violet-300 cursor-pointer hover:border-cyan-400 transition-colors">
                                        <UploadIcon />
                                        <span>{isMobile ? "Or upload from gallery" : "Click to upload image"}</span>
                                    </label>
                                </>
                            ) : (
                                <div className="relative w-full h-48 bg-black/50 rounded-md border border-cyan-400/30 overflow-hidden group">
                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                         <p className="text-white text-sm mb-2 truncate max-w-[90%]">{fileName}</p>
                                         <button 
                                            onClick={removeImage}
                                            className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                         >
                                             <TrashIcon /> Remove
                                         </button>
                                    </div>
                                    <button 
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white md:hidden"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-violet-300/50 mt-1">Supported: JPG, PNG (Max 800KB)</p>
                    </div>
                </form>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-[#0b0f1a]/85 backdrop-blur-sm border-t border-cyan-400/20 flex gap-4">
                <button
                    type="submit"
                    form="report-issue-form"
                    disabled={isSubmitting || isAnalyzingImage}
                    className="flex-1 px-4 py-3 bg-cyan-500/20 border-2 border-cyan-400 rounded-lg text-cyan-400 font-bold uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Processing...' : 'Submit Report'}
                </button>
                <button 
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-violet-500/10 border-2 border-violet-500 rounded-lg text-violet-300 font-bold uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all duration-300 disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>

            {/* Success Toast */}
            <div 
                className={`absolute bottom-28 left-1/2 -translate-x-1/2 p-4 rounded-lg bg-green-500/20 border border-green-400 text-green-300 shadow-[0_0_15px_rgba(74,222,128,0.4)] transition-all duration-300 ease-in-out whitespace-nowrap
                ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                role="alert"
            >
                {successMessage}
            </div>
        </div>
    );
};

export default ReportIssuePanel;
