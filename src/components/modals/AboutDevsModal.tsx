import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Code2, Users, Heart, Sparkles, Mail } from 'lucide-react';

export const AboutDevsModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();

  if (activeModal !== 'about_devs') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 tracking-tight">Meet the Developers</h3>
              <p className="text-xs text-slate-400">The team behind PetroKnow</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Developer 1 */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 mb-3 shadow-lg shadow-teal-500/20">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-lg font-extrabold text-teal-300">
                  TB
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-100">Tubagus Fitran Badruttamam</h4>
              <p className="text-xs text-teal-400 font-medium mt-0.5">Product & Systems Engineer</p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                Focusing on manufacturing operations architecture, AI knowledge retrieval workflows, and digital twin system integration.
              </p>
            </div>

            {/* Developer 2 */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 mb-3 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-lg font-extrabold text-cyan-300">
                  WA
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-100">Wulan Nur Adhayani</h4>
              <p className="text-xs text-cyan-400 font-medium mt-0.5">UX & Human-Centered Design</p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                Crafting intuitive plant operator experiences, tacit knowledge verification lifecycles, and industrial field tooling interfaces.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/40 text-slate-300 text-sm leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Creator Note
            </div>
            <p className="italic text-slate-300">
              "Built this prototype wholeheartedly to help solve a real problem: knowledge slipping away before it's ever written down. Found a bug or have an idea for a new feature? Reach out to us anytime!"
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-teal-400" />
              <span>PetroKnow Industrial Platform</span>
            </div>
            <a
              href="mailto:fitrantubagus@gmail.com"
              className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
