import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  // Check if user arrived via a valid reset link (they'll have an active session)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      }
      setChecking(false);
    };

    // Listen for auth events — Supabase fires PASSWORD_RECOVERY when the reset link is clicked
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setHasSession(true);
        setChecking(false);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!hasSession && !checking) {
    return (
      <div className="min-h-screen bg-navy text-white flex flex-col">
        <header className="w-full py-6 px-4 sm:px-8 flex items-center justify-between border-b border-white/5 bg-navy/50 backdrop-blur-sm sticky top-0 z-10">
          <Link to="/" className="text-2xl font-bold text-white tracking-tighter">
            TRADE<span className="text-accent">X</span>
          </Link>
        </header>
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-[380px] w-full text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invalid or Expired Link</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/reset-password"
              className="block w-full py-2.5 px-4 rounded-xl text-sm font-bold text-navy bg-accent hover:bg-accent-hover transition-colors text-center"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-white font-sans flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-8 flex items-center justify-between border-b border-white/5 bg-navy/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex-shrink-0">
          <Link to="/" className="text-2xl font-bold text-white tracking-tighter">
            TRADE<span className="text-accent">X</span>
          </Link>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center px-4 py-4">
        <div className="max-w-[380px] w-full">
          {success ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Your password has been successfully changed. You'll be redirected to your dashboard shortly.
              </p>
              <Link
                to="/dashboard"
                className="block w-full py-2.5 px-4 rounded-xl text-sm font-bold text-navy bg-accent hover:bg-accent-hover transition-colors text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Set New Password</h2>
                <p className="text-gray-400 text-sm">
                  Choose a strong password for your TRADEX account.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2.5 rounded-xl text-sm mb-4 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full pl-4 pr-12 py-2.5 bg-navy-light border border-transparent rounded-xl focus:outline-none focus:border-white/20 text-white placeholder-gray-500 transition-colors"
                      placeholder="At least 6 characters"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-navy-light border border-transparent rounded-xl focus:outline-none focus:border-white/20 text-white placeholder-gray-500 transition-colors"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* Password strength hints */}
                <div className="space-y-1.5">
                  <div className={`flex items-center space-x-2 text-xs ${password.length >= 6 ? 'text-green-500' : 'text-gray-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span>At least 6 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs ${password && password === confirmPassword ? 'text-green-500' : 'text-gray-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${password && password === confirmPassword ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span>Passwords match</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || password.length < 6 || password !== confirmPassword}
                  className="w-full py-2.5 px-4 rounded-xl shadow-sm text-sm font-bold text-navy bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
