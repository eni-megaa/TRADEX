import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { createAdminNotification } from '../lib/adminNotifications';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Notify admins about new user registration (fire-and-forget, may silently fail if session not yet active)
      createAdminNotification({
        title: 'New User Registration',
        message: `${firstName} ${lastName} (${email}) has just registered on the platform.`,
        type: 'new_user'
      });

      setSuccessMsg('Registration successful! Please check your email to verify your account.');
      setLoading(false);
      // Optional: automatically navigate to login after a few seconds
      setTimeout(() => navigate('/dashboard'), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white font-sans flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-8 flex items-center justify-between border-b border-white/5 bg-navy/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex-shrink-0">
          <Link to="/" className="text-2xl font-bold text-white tracking-tighter">
            TRADE<span className="text-accent">X</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-6 sm:space-x-8">
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</Link>
          <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Contact</a>
          <Link to="/tools/economic-calendar" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Resources</Link>
        </nav>
      </header>

      <div className="flex-grow flex items-center justify-center px-4 py-2">
        <div className="max-w-[340px] w-full">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-1">Sign Up Account</h2>
            <p className="text-gray-400 text-sm">Enter your personal data to create your account.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2 rounded-md text-sm mb-4 text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-2 rounded-md text-sm mb-4 text-center">
              {successMsg}
            </div>
          )}

          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center space-x-3 py-2.5 px-4 bg-transparent border border-white/20 rounded-xl shadow-sm text-sm font-medium text-white hover:bg-white/5 transition-colors focus:outline-none"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
              <span>Google</span>
            </button>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-navy text-gray-500">Or</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-navy-light border border-transparent rounded-xl focus:outline-none focus:border-white/20 text-white placeholder-gray-500 transition-colors"
                  placeholder="eg. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-navy-light border border-transparent rounded-xl focus:outline-none focus:border-white/20 text-white placeholder-gray-500 transition-colors"
                  placeholder="eg. Francisco"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 bg-navy-light border border-transparent rounded-xl focus:outline-none focus:border-white/20 text-white placeholder-gray-500 transition-colors"
                placeholder="eg. johnfrans@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="w-full pl-4 pr-12 py-2.5 bg-navy-light border border-transparent rounded-xl focus:outline-none focus:border-white/20 text-white placeholder-gray-500 transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters.</p>
              <p className="mt-1 text-xs text-gray-400">At least one number</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 px-4 rounded-xl shadow-sm text-sm font-bold text-navy bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-white hover:text-accent transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
