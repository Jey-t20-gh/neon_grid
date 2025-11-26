
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Icons
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

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/splash');
    } catch (err: any) {
        console.error("Login Error:", err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
            setError('Invalid email or password.');
        } else {
            setError('An error occurred. Please try again.');
        }
        console.error("Login Error:", err.code, err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-cyan-300 uppercase tracking-wider" style={{ textShadow: '0 0 4px #00ffff' }}>
            System Access
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/20 border border-red-400 text-red-300 text-sm p-3 rounded-lg text-center">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="login-email" className="sr-only">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MailIcon />
                    </div>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full bg-black/30 border border-violet-500/30 rounded-lg p-3 pl-10 text-white placeholder-violet-300/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                        placeholder="Email Address"
                    />
                </div>
            </div>
             <div>
                <label htmlFor="login-password" className="sr-only">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockIcon />
                    </div>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="w-full bg-black/30 border border-violet-500/30 rounded-lg p-3 pl-10 text-white placeholder-violet-300/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                        placeholder="Password"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-violet-500/50 bg-black/30 text-cyan-500 focus:ring-cyan-500" />
                    <label htmlFor="remember-me" className="ml-2 block text-violet-300">Remember me</label>
                </div>
                <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300">Forgot password?</a>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold uppercase tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-cyan-500 transition-all duration-300 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <SpinnerIcon /> : 'Log In'}
            </button>
        </form>
        <p className="text-center text-sm text-violet-300">
            Don’t have an account?{' '}
            <button onClick={onSwitchToSignup} className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign up
            </button>
        </p>
    </div>
  );
};

export default Login;