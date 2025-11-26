import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Icons
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const MicrophoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 6a3 3 0 01-3 3v-3a3 3 0 013-3v3z" /></svg>;
const SpinnerIcon = () => (
    <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const themeColors = [
    { name: 'cyan', color: '#00ffff' },
    { name: 'violet', color: '#8b5cf6' },
    { name: 'magenta', color: '#ec4899' },
    { name: 'amber', color: '#f59e0b' },
];

const AnimatedToggle = ({ enabled, onChange, labelId }) => (
    <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black/50 ${enabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
        role="switch"
        aria-checked={enabled}
        aria-labelledby={labelId}
    >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
    </button>
);

interface UserProfile {
    name: string;
    email: string;
    avatarUrl: string;
    tagline: string;
}

const Profile: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        voiceAssistant: true,
        notifications: false,
        theme: "cyan"
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const docRef = db.collection("users").doc(user.uid);
                    const docSnap = await docRef.get();

                    if (docSnap.exists) {
                        const userData = docSnap.data();
                        if (userData) {
                            setUserProfile({
                                name: userData.username,
                                email: user.email || '',
                                avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
                                tagline: userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Civic Contributor"
                            });
                        }
                    } else {
                        // User exists in Auth, but not in Firestore. Let's create a profile to self-heal.
                        console.warn("User document not found. Creating a new profile document.");
                        
                        const username = user.email ? user.email.split('@')[0] : 'new_user';

                        const newUserProfileData = {
                            username: username,
                            email: user.email,
                            role: 'citizen',
                            location: '',
                            created_at: firebase.firestore.FieldValue.serverTimestamp(),
                        };

                        await docRef.set(newUserProfileData);
                        
                        // Set local state to render the profile screen immediately
                        setUserProfile({
                            name: username,
                            email: user.email || '',
                            avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
                            tagline: "Civic Contributor"
                        });
                    }
                } catch (error) {
                    console.error("Error fetching or creating user data:", error);
                    await auth.signOut();
                    navigate('/');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSave = () => {
        // Here you would typically save settings to Firestore
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error: any) {
            console.error("Logout Error:", error.code, error.message);
            alert("Failed to log out. Please try again.");
        }
    };

    const SettingRow = ({ icon, label, children, labelId }) => (
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-md border border-violet-500/20">
            <div className="flex items-center gap-3">
                <div className="text-violet-400">{icon}</div>
                <span id={labelId} className="text-violet-200">{label}</span>
            </div>
            {children}
        </div>
    );
    
    if (loading) {
        return (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
                <SpinnerIcon />
            </div>
        );
    }

    if (!userProfile) {
        // This case is handled by the redirect in useEffect, but returning null prevents rendering flicker.
        return null; 
    }

    return (
        <div className="absolute inset-0 pt-8 pb-24 px-4 md:px-8 z-10 animate-fadeIn text-white pointer-events-auto">
             <style>{`
                .custom-scrollbar-profile::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-profile::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-profile::-webkit-scrollbar-thumb { background: #8b5cf660; border-radius: 6px; }
                .custom-scrollbar-profile::-webkit-scrollbar-thumb:hover { background: #8b5cf690; }
            `}</style>
            <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 uppercase tracking-widest" style={{ textShadow: '0 0 8px #00ffff' }}>
                    Profile & Settings
                </h1>
                <div className="w-24 h-px bg-cyan-400/50 mx-auto mt-3"></div>
            </div>

            <div className="max-w-3xl mx-auto h-full overflow-y-auto custom-scrollbar-profile pr-2 -mr-2">
                <div className="bg-black/20 backdrop-blur-md rounded-lg border border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.1)] p-6 flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <img src={userProfile.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.4)]" />
                    <div>
                        <h2 className="text-2xl font-bold text-cyan-300">{userProfile.name}</h2>
                        <p className="text-violet-300">{userProfile.email}</p>
                        <p className="text-xs mt-2 bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full inline-block border border-violet-500/30">{userProfile.tagline}</p>
                    </div>
                </div>

                <div className="bg-black/20 backdrop-blur-md rounded-lg border border-cyan-400/30 p-6 space-y-4">
                    <SettingRow icon={<MicrophoneIcon />} label="Enable Voice Assistant" labelId="voice-assist-label">
                        <AnimatedToggle enabled={settings.voiceAssistant} onChange={() => handleSettingChange('voiceAssistant', !settings.voiceAssistant)} labelId="voice-assist-label" />
                    </SettingRow>
                    <SettingRow icon={<BellIcon />} label="Enable Notifications" labelId="notifications-label">
                        <AnimatedToggle enabled={settings.notifications} onChange={() => handleSettingChange('notifications', !settings.notifications)} labelId="notifications-label" />
                    </SettingRow>
                    
                    {/* Theme Customization */}
                    <div className="pt-4 mt-4 border-t border-violet-500/20">
                        <h3 className="text-lg font-bold text-cyan-300 mb-3">Accent Theme</h3>
                        <div className="flex items-center gap-4">
                            {themeColors.map(theme => (
                                <button
                                    key={theme.name}
                                    onClick={() => handleSettingChange('theme', theme.name)}
                                    className={`w-8 h-8 rounded-full transition-all duration-200 ${settings.theme === theme.name ? 'ring-2 ring-offset-2 ring-offset-black/50' : ''}`}
                                    style={{
                                        backgroundColor: theme.color,
                                        boxShadow: settings.theme === theme.name
                                            ? `var(--tw-ring-shadow), 0 0 10px ${theme.color}`
                                            : `0 0 10px ${theme.color}`,
                                        '--tw-ring-color': theme.color,
                                    } as React.CSSProperties}
                                    aria-label={`Set theme to ${theme.name}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-cyan-500/20 border-2 border-cyan-400 rounded-lg text-cyan-400 font-bold uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all duration-300"
                    >
                        Save Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 px-4 py-3 bg-violet-500/10 border-2 border-violet-500 rounded-lg text-violet-300 font-bold uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all duration-300"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Success Toast */}
             <div 
                className={`fixed bottom-28 left-1/2 -translate-x-1/2 p-4 rounded-lg bg-green-500/20 border border-green-400 text-green-300 shadow-[0_0_15px_rgba(74,222,128,0.4)] transition-all duration-300 ease-in-out
                ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                role="alert"
            >
                ✅ Preferences saved successfully!
            </div>
        </div>
    );
};

export default Profile;