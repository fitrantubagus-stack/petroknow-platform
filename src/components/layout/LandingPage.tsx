import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChandraAsriLogo } from '../common/ChandraAsriLogo';
import { 
  Cpu, ArrowRight, ShieldCheck, QrCode, Sparkles, 
  Clock, Map, Layers, CheckCircle2, ChevronDown, 
  HelpCircle, Users, Activity, FileText, Barcode, 
  Check, Lock, ExternalLink, Flame 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setActiveModal } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'How does PetroKnow prevent AI hallucinations during critical plant operations?',
      a: 'Unlike generic LLMs that generate speculative text, PetroKnow uses a deterministic retrieval-augmented pipeline constrained strictly to verified standard operating procedures (SOPs) and expert-approved tacit knowledge. If similarity scores fall below confidence thresholds, the system explicitly refuses to guess and logs a formal Knowledge Gap for SME review.'
    },
    {
      q: 'How does the physical QR and Linear Barcode integration work?',
      a: 'Every piece of plant equipment has a generated 2D QR code encoding its unique equipment ID, and every spare wear-part has a 1D Code128 linear barcode. Operators can scan physical tags with their mobile device or camera to instantly pull up live equipment telemetry, linked SOPs, and low-stock alerts without manual searching.'
    },
    {
      q: 'What is the Knowledge Freshness & Decay Score?',
      a: 'Safety-critical procedures degrade in reliability if left unreviewed across turnarounds and engineering modifications. PetroKnow tracks the Last Verified Date and calculates dynamic decay scores (Fresh, Aging, Stale), prompting plant supervisors and SMEs to re-verify procedures on a configurable schedule.'
    },
    {
      q: 'How is tacit expert know-how captured from retiring senior operators?',
      a: 'Senior field veterans can submit structured field observations, motor current sound heuristics, and situational tricks directly through the Tacit Knowledge workflow. These submissions are routed to the Verification Queue for SME review before becoming citable by the AI Assistant.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-100">
                Petro<span className="text-teal-400">Know</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">AI Manufacturing Knowledge Hub</p>
            </div>
            <div className="hidden sm:flex items-center pl-3 ml-2 border-l border-slate-800">
              <ChandraAsriLogo size={24} showWordmark={true} />
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-teal-400 transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-teal-400 transition-colors">Core Features</button>
            <button onClick={() => scrollToSection('impact')} className="hover:text-teal-400 transition-colors">Projected Impact</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-teal-400 transition-colors">FAQ</button>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal('login_role')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Login as Role
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-500/25 hover:scale-[1.02]"
            >
              <span>Try Prototype</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-slate-800/80">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Next-Gen Petrochemical Knowledge Architecture</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-[1.15]">
                Your Plant’s Operational Knowledge, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200">Instantly Verified & Actionable</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
                Unify scattered paper SOPs, field veteran tacit knowledge, and physical equipment into a single AI-searchable hub with 100% traceability, live QR physical floor tags, and digital twin health monitoring.
              </p>

              <div className="flex items-center gap-4 flex-wrap pt-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-teal-500/20 hover:scale-[1.02]"
                >
                  <span>Launch Live Mission Control</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setActiveModal('login_role'); }}
                  className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-teal-400" />
                  <span>Select Role Profile</span>
                </button>
              </div>

              {/* Key Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-xl">
                <div>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-teal-400">1,240+</p>
                  <p className="text-xs text-slate-400 mt-0.5">SOPs & Tacit Logs</p>
                </div>
                <div>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-cyan-400">100%</p>
                  <p className="text-xs text-slate-400 mt-0.5">Traceable Citations</p>
                </div>
                <div>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">0.0%</p>
                  <p className="text-xs text-slate-400 mt-0.5">Hallucination Risk</p>
                </div>
              </div>
            </div>

            {/* Right Mockup Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl p-5 backdrop-blur-md space-y-4">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">AI Knowledge Assistant</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Live Verified
                  </span>
                </div>

                {/* Operator Query */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                    OP
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-300">Field Operator @ Zone B</span>
                    <p className="text-xs text-slate-200 mt-0.5 font-medium">
                      "Compressor C-204 Stage 2 discharge temp is spiking at 122°C with valve flutter sound. What is the immediate recovery step?"
                    </p>
                  </div>
                </div>

                {/* AI Computed Response Card */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-bold text-teal-300">PetroKnow Knowledge Match</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Verified by SME
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    <strong>Reciprocating Compressor C-204 Stage 2 Discharge High Temp:</strong><br />
                    1. Perform thermographic scan across valve caps (&gt;15°C delta indicates leaking plate valve).<br />
                    2. Unload cylinder pocket clearance to 50% immediately to reduce thermal stress.<br />
                    3. Cross-check lube oil filter differential pressure (&lt; 0.8 bar).
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-teal-400">Source: SOP-MNT-CMP-204 / Dr. Irwan Santoso</span>
                    <span className="text-emerald-400 font-semibold">98.4% Confidence</span>
                  </div>
                </div>

                {/* Floating Status Pill */}
                <div className="flex items-center justify-between text-xs px-2 pt-1 text-slate-400">
                  <span>Matched equipment: <strong className="text-slate-200 font-mono">EQ-CMP-204</strong></span>
                  <span className="text-teal-400 hover:underline cursor-pointer" onClick={() => setCurrentView('assistant')}>
                    Open in Assistant →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Operational Lifecycle</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              From Physical Floor to Verified AI in 4 Steps
            </h2>
            <p className="text-sm text-slate-400">
              A closed-loop knowledge management system built specifically for high-reliability manufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold font-mono text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-100">Scan & Ask</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan physical equipment QR codes or type operational questions in plain language from any field tablet or console.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-100">AI Retrieves & Cites</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic matching computes relevance scores against verified SOPs and cites the exact document source and verifier.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-100">Expert Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Senior SMEs review scanned paper drafts, tacit operator tips, and knowledge gaps before they are indexed for general use.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-slate-100">Freshness Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated decay timers monitor verification dates and surface aging procedures before turnarounds or safety audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Core Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Engineered for Industrial Plant Operations
            </h2>
            <p className="text-sm text-slate-400">
              Purpose-built tools bridging the physical plant floor with digital engineering intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 w-fit">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">AI Knowledge Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conversational search with exact source citations, status badges, and photo-assisted gauge & alarm code analysis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">QR & Linear Barcode Center</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real QR code generation for equipment nodes and linear Code128 barcodes for spare parts with camera scanning.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 w-fit">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Digital Twin Plant Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive 2D schematic of plant equipment nodes reflecting live knowledge health halos (Green, Amber, Red).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 w-fit">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Decay & Freshness Score</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic decay tracking calculates procedure age against safety thresholds with one-click re-verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Impact KPI Cards */}
      <section id="impact" className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Projected Business Impact</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Measurable Operational Value
            </h2>
            <p className="text-sm text-slate-400">
              Estimated efficiencies based on petrochemical plant field workflows and turnaround studies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <p className="font-mono text-3xl font-extrabold text-teal-400">90%</p>
              <h4 className="text-sm font-bold text-slate-100">Faster Answer Retrieval</h4>
              <p className="text-xs text-slate-400">
                Reduces typical operator query time from ~25 minutes in binder archives down to &lt; 2 minutes on mobile/tablet.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <p className="font-mono text-3xl font-extrabold text-cyan-400">100%</p>
              <h4 className="text-sm font-bold text-slate-100">Traceable to Author/Doc</h4>
              <p className="text-xs text-slate-400">
                Every AI response is bound to an exact SOP document or verified SME review record, eliminating black-box uncertainty.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <p className="font-mono text-3xl font-extrabold text-emerald-400">0%</p>
              <h4 className="text-sm font-bold text-slate-100">Retirement Know-How Loss</h4>
              <p className="text-xs text-slate-400">
                Captures veteran heuristics and operational tricks into structured, verified digital assets before personnel departure.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <p className="font-mono text-3xl font-extrabold text-indigo-400">4.8x</p>
              <h4 className="text-sm font-bold text-slate-100">Quicker Overpressure Response</h4>
              <p className="text-xs text-slate-400">
                Instant access to emergency quench and flare routing steps directly from scanned equipment QR tags during upsets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Technical & Operational Architecture
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left font-bold text-sm text-slate-100 flex items-center justify-between gap-4 hover:text-teal-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Ready to Experience PetroKnow?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Test the live AI retrieval engine, interactive 2D digital twin plant map, real camera QR & barcode scanner, and knowledge verification workflow.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-xl shadow-teal-500/25 hover:scale-[1.02]"
            >
              <span>Explore the Working Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-200">PetroKnow</span>
            <span>— AI-Powered Manufacturing Knowledge Hub</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveModal('about_devs')}
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Meet the Developers</span>
            </button>
            <span>Internal Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
