

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';


// Icons
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
    }

    try {
        const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
            await setDoc(doc(db, 'users', user.uid), {
                username: username,
                email: email,
                role: 'citizen',
                location: '', // Can be updated later
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });
        }

        navigate('/splash');
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError('This email address is already in use.');
        } else if (err.code === 'auth/weak-password') {
            setError('Password should be at least 6 characters.');
        } else {
            setError('An error occurred. Please try again.');
        }
        console.error("Signup Error:", err.code, err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-cyan-300 uppercase tracking-wider" style={{ textShadow: '0 0 4px #00ffff' }}>
            Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/20 border border-red-400 text-red-300 text-sm p-3 rounded-lg text-center">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon />
                    </div>
                    <input id="username" name="username" type="text" required className="w-full bg-black/30 border border-violet-500/30 rounded-lg p-3 pl-10 text-white placeholder-violet-300/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all" placeholder="Username" />
                </div>
            </div>
            <div>
                <label htmlFor="signup-email" className="sr-only">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MailIcon />
                    </div>
                    <input id="signup-email" name="email" type="email" autoComplete="email" required className="w-full bg-black/30 border border-violet-500/30 rounded-lg p-3 pl-10 text-white placeholder-violet-300/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all" placeholder="Email Address" />
                </div>
            </div>
             <div>
                <label htmlFor="signup-password" className="sr-only">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockIcon />
                    </div>
                    <input id="signup-password" name="password" type="password" autoComplete="new-password" required className="w-full bg-black/30 border border-violet-500/30 rounded-lg p-3 pl-10 text-white placeholder-violet-300/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all" placeholder="Password" />
                </div>
            </div>
             <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockIcon />
                    </div>
                    <input id="confirm-password" name="confirm-password" type="password" required className="w-full bg-black/30 border border-violet-500/30 rounded-lg p-3 pl-10 text-white placeholder-violet-300/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all" placeholder="Confirm Password" />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold uppercase tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-cyan-500 transition-all duration-300 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <SpinnerIcon /> : 'Sign Up'}
            </button>
        </form>
        <p className="text-center text-sm text-violet-300">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            Log in
            </button>
        </p>
    </div>
  );
};

export default Signup;