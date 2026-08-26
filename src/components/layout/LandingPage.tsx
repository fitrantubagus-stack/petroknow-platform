import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ChandraAsriLogo } from '../common/ChandraAsriLogo';
import { 
  Cpu, ArrowRight, ShieldCheck, QrCode, Sparkles, 
  Clock, Map, Layers, CheckCircle2, ChevronDown, 
  HelpCircle, Users, Activity, FileText, Barcode, 
  Check, Lock, ExternalLink, Flame, Mail 
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

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Scan & Ask',
      route: '/scan-center',
      viewId: 'scancenter' as const,
      badgeColor: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
      description: 'Scan physical equipment QR codes or type operational questions in plain language from any field tablet or console.'
    },
    {
      step: '02',
      title: 'AI Retrieves & Cites',
      route: '/ai-assistant',
      viewId: 'assistant' as const,
      badgeColor: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      description: 'Deterministic matching computes relevance scores against verified SOPs and cites the exact document source and verifier.'
    },
    {
      step: '03',
      title: 'Expert Verification',
      route: '/verification-queue',
      viewId: 'verification' as const,
      badgeColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      description: 'Senior SMEs review scanned paper drafts, tacit operator tips, and knowledge gaps before they are indexed for general use.'
    },
    {
      step: '04',
      title: 'Freshness Tracking',
      route: '/freshness',
      viewId: 'freshness' as const,
      badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      description: 'Automated decay timers monitor verification dates and surface aging procedures before turnarounds or safety audits.'
    }
  ];

  const coreFeatures = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      badgeClass: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
      title: 'AI Knowledge Assistant',
      description: 'Conversational search with exact source citations, status badges, and photo-assisted gauge & alarm code analysis.'
    },
    {
      icon: <QrCode className="w-5 h-5" />,
      badgeClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      title: 'QR & Linear Barcode Center',
      description: 'Real QR code generation for equipment nodes and linear Code128 barcodes for spare parts with camera scanning.'
    },
    {
      icon: <Map className="w-5 h-5" />,
      badgeClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      title: 'Digital Twin Plant Map',
      description: 'Interactive 2D schematic of plant equipment nodes reflecting live knowledge health halos (Green, Amber, Red).'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      badgeClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      title: 'Decay & Freshness Score',
      description: 'Dynamic decay tracking calculates procedure age against safety thresholds with one-click re-verification.'
    }
  ];

  const impactKpis = [
    {
      metric: '90%',
      metricColor: 'text-teal-400',
      title: 'Faster Answer Retrieval',
      description: 'Reduces typical operator query time from ~25 minutes in binder archives down to < 2 minutes on mobile/tablet.'
    },
    {
      metric: '100%',
      metricColor: 'text-cyan-400',
      title: 'Traceable to Author/Doc',
      description: 'Every AI response is bound to an exact SOP document or verified SME review record, eliminating black-box uncertainty.'
    },
    {
      metric: '0%',
      metricColor: 'text-emerald-400',
      title: 'Retirement Know-How Loss',
      description: 'Captures veteran heuristics and operational tricks into structured, verified digital assets before personnel departure.'
    },
    {
      metric: '4.8x',
      metricColor: 'text-indigo-400',
      title: 'Quicker Overpressure Response',
      description: 'Instant access to emergency quench and flare routing steps directly from scanned equipment QR tags during upsets.'
    }
  ];

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
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
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
          </Link>

          {/* Nav Links with real anchors and native URL preview */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a 
              href="#how-it-works" 
              onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} 
              className="hover:text-teal-400 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} 
              className="hover:text-teal-400 transition-colors"
            >
              Core Features
            </a>
            <a 
              href="#impact" 
              onClick={(e) => { e.preventDefault(); scrollToSection('impact'); }} 
              className="hover:text-teal-400 transition-colors"
            >
              Projected Impact
            </a>
            <a 
              href="#faq" 
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} 
              className="hover:text-teal-400 transition-colors"
            >
              FAQ
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              onClick={(e) => {
                e.preventDefault();
                setActiveModal('login_role');
              }}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Login as Role
            </Link>
            <Link
              to="/mission-control"
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-500/25 hover:scale-[1.02]"
            >
              <span>Try Prototype</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-left"
            >
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
                <Link
                  to="/mission-control"
                  onClick={() => setCurrentView('dashboard')}
                  className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-teal-500/20 hover:scale-[1.02]"
                >
                  <span>Launch Live Mission Control</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
            </motion.div>

            {/* Right Mockup Preview Card */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              className="lg:col-span-5 relative"
            >
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
                  <Link 
                    to="/ai-assistant" 
                    onClick={() => setCurrentView('assistant')}
                    className="text-teal-400 hover:text-teal-300 hover:underline font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Open in Assistant →</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Operational Lifecycle</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              From Physical Floor to Verified AI in 4 Steps
            </h2>
            <p className="text-sm text-slate-400">
              A closed-loop knowledge management system built specifically for high-reliability manufacturing. Click any step to test live.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {howItWorksSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
                className="h-full"
              >
                <Link
                  to={step.route}
                  onClick={() => setCurrentView(step.viewId)}
                  className="block h-full p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-teal-500/50 hover:bg-slate-800/80 hover:-translate-y-1 transition-all duration-200 group cursor-pointer relative shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold font-mono text-sm group-hover:scale-105 transition-transform ${step.badgeColor}`}>
                      {step.step}
                    </div>
                    <span className="text-[11px] text-slate-500 group-hover:text-teal-400 font-semibold flex items-center gap-0.5 transition-colors">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    {step.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Core Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Engineered for Industrial Plant Operations
            </h2>
            <p className="text-sm text-slate-400">
              Purpose-built tools bridging the physical plant floor with digital engineering intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className={`p-3 rounded-xl border w-fit ${feat.badgeClass}`}>
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-100">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Impact KPI Cards */}
      <section id="impact" className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Projected Business Impact</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Measurable Operational Value
            </h2>
            <p className="text-sm text-slate-400">
              Estimated efficiencies based on petrochemical plant field workflows and turnaround studies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactKpis.map((kpi, idx) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2"
              >
                <p className={`font-mono text-3xl font-extrabold ${kpi.metricColor}`}>{kpi.metric}</p>
                <h4 className="text-sm font-bold text-slate-100">{kpi.title}</h4>
                <p className="text-xs text-slate-400">
                  {kpi.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center space-y-3"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Technical & Operational Architecture
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="py-16 bg-gradient-to-b from-slate-950 to-slate-900"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Ready to Experience PetroKnow?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Test the live AI retrieval engine, interactive 2D digital twin plant map, real camera QR & barcode scanner, and knowledge verification workflow.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/mission-control"
              onClick={() => setCurrentView('dashboard')}
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-xl shadow-teal-500/25 hover:scale-[1.02]"
            >
              <span>Explore the Working Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Clean Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-200">PetroKnow</span>
            <span>— AI-Powered Manufacturing Knowledge Hub</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/contact"
              className="text-slate-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </Link>
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
