import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Reset link dispatched to your inbox!', 'success');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to login
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset your password</h2>
        <p className="text-sm text-slate-500 mt-1">Enter your email and we'll send you a link to reset your account password.</p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base">Check your email</h3>
          <p className="text-xs text-emerald-700 leading-relaxed">
            We sent a password reset link to <strong className="font-semibold">{email}</strong>. Please check your inbox and spam folder.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs font-semibold text-emerald-800 hover:underline pt-2 inline-block"
          >
            Try another email address
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
