import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ChandraAsriLogo } from '../common/ChandraAsriLogo';
import { 
  Cpu, ArrowLeft, Send, CheckCircle2, AlertCircle, 
  Mail, MessageSquare, User, HelpCircle, Loader2, Sparkles 
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const { setActiveModal } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'General Feedback' | 'Report a Problem with the Website' | 'Feature Suggestion'>('General Feedback');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateForm = () => {
    if (!name.trim()) {
      setValidationError('Please enter your name.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (!category) {
      setValidationError('Please select what this is about.');
      return false;
    }
    if (!message.trim()) {
      setValidationError('Please enter your message.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: 'ab6bc352-5627-4b70-af5d-30ba831e2057',
          name: name.trim(),
          email: email.trim(),
          subject: `[PetroKnow] ${category} - from ${name.trim()}`,
          category: category,
          message: `[Category: ${category}]\n\n${message.trim()}`,
          from_name: name.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && (data.success || data.status === 'success')) {
        setSubmitStatus('success');
        setName('');
        setEmail('');
        setCategory('General Feedback');
        setMessage('');
        setValidationError('');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Failed to deliver message. Please try again or reach out directly via email.');
      }
    } catch (err: any) {
      setSubmitStatus('error');
      setErrorMessage(err?.message || 'Network error occurred while sending your message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                PetroKnow
              </span>
              <span className="text-[10px] font-mono text-slate-400 block -mt-1 tracking-wider uppercase">
                Plant Knowledge AI
              </span>
            </div>
            <div className="hidden sm:flex items-center pl-3 ml-2 border-l border-slate-800">
              <ChandraAsriLogo size={20} showWordmark={true} />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              to="/mission-control"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20"
            >
              Launch Workspace
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Form Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
              <Mail className="w-3.5 h-3.5" />
              <span>Direct Communication Channel</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Contact Us
            </h1>
            <p className="text-sm text-slate-400">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </div>

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            {/* Success Alert */}
            {submitStatus === 'success' && (
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-teal-200">
                    Thanks — your message has been sent!
                  </p>
                  <p className="text-xs text-teal-300/90 leading-relaxed">
                    We've received your submission via Web3Forms and our engineering team will get back to you soon.
                  </p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {submitStatus === 'error' && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-rose-200">
                    Message delivery failed
                  </p>
                  <p className="text-xs text-rose-300/90 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Field 1: Your Name */}
              <div className="space-y-2">
                <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>Your Name <span className="text-rose-400">*</span></span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (validationError) setValidationError(''); }}
                  placeholder="e.g. Fitran Badruttamam"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              {/* Field 2: Your Email */}
              <div className="space-y-2">
                <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  <span>Your Email <span className="text-rose-400">*</span></span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (validationError) setValidationError(''); }}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              {/* Field 3: What's this about? */}
              <div className="space-y-2">
                <label htmlFor="contact-category" className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                  <span>What's this about? <span className="text-rose-400">*</span></span>
                </label>
                <select
                  id="contact-category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors cursor-pointer"
                >
                  <option value="General Feedback">General Feedback</option>
                  <option value="Report a Problem with the Website">Report a Problem with the Website</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                </select>
              </div>

              {/* Field 4: Your Message */}
              <div className="space-y-2">
                <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                  <span>Your Message <span className="text-rose-400">*</span></span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); if (validationError) setValidationError(''); }}
                  placeholder="Tell us what's on your mind, or describe the issue you ran into..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors resize-y leading-relaxed"
                />
              </div>

              {/* Field 5: Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                    isSubmitting
                      ? 'bg-teal-500/60 text-slate-900 cursor-not-allowed'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Support & Meet Developers Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Direct inquiries also routed to Nexust Team engineers.</span>
            </div>
            <button
              onClick={() => setActiveModal('about_devs')}
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Meet Nexust Team</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-200">PetroKnow</span>
            <span>— AI-Powered Manufacturing Knowledge Hub</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveModal('about_devs')}
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              Meet the Developers
            </button>
            <span>Internal Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
