import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
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
          <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Register</Link>
        </nav>
      </header>

      <div className="flex-grow flex items-center justify-center px-4 py-4">
        <div className="max-w-[380px] w-full">
          {sent ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                We've sent a password reset link to <span className="text-white font-semibold">{email}</span>. 
                Click the link in the email to set a new password.
              </p>
              <p className="text-gray-500 text-xs mb-8">
                Didn't receive it? Check your spam folder or try again in a few minutes.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Try a different email
                </button>
                <Link 
                  to="/login" 
                  className="block w-full py-2.5 px-4 rounded-xl text-sm font-bold text-navy bg-accent hover:bg-accent-hover transition-colors text-center"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Reset Password</h2>
                <p className="text-gray-400 text-sm">
                  Enter the email associated with your account and we'll send a reset link.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2.5 rounded-xl text-sm mb-4 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 bg-navy-light border border-transparent rounded-xl focus:outline-none focus:border-white/20 text-white placeholder-gray-500 transition-colors"
                    placeholder="eg. johnfrans@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl shadow-sm text-sm font-bold text-navy bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Reset Link'}
                </button>
              </form>

              <Link
                to="/login"
                className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
