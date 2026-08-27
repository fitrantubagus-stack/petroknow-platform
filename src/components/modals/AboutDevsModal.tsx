import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Code2, Users, Sparkles, Mail, ArrowLeft, 
  GraduationCap, Calendar, Hash, Building2, BookOpen, Heart, 
  ExternalLink, UserCheck, ChevronRight 
} from 'lucide-react';

interface DeveloperProfile {
  id: string;
  name: string;
  initials: string;
  roleTitle: string;
  shortDescription: string;
  fullName: string;
  placeAndDateOfBirth: string;
  nim: string;
  faculty: string;
  university: string;
  studyProgram: string;
  hobbies: string;
  email: string;
  gradient: string;
  textGradient: string;
  badgeColor: string;
}

const DEVELOPERS: DeveloperProfile[] = [
  {
    id: 'tubagus',
    name: 'Tubagus Fitran Badruttamam',
    initials: 'TB',
    roleTitle: 'Product & Systems Engineer',
    shortDescription: 'Focusing on manufacturing operations architecture, AI knowledge retrieval workflows, and digital twin system integration.',
    fullName: 'Tubagus Fitran Badruttamam',
    placeAndDateOfBirth: 'Cilegon, October 24, 2006',
    nim: '24010380029',
    faculty: 'Faculty of Engineering and Computer Science',
    university: 'Universitas Muhammadiyah Banten',
    studyProgram: 'Informatics Engineering',
    hobbies: 'Reading, writing novels',
    email: 'fitrantubagus@gmail.com',
    gradient: 'from-teal-500 to-cyan-400',
    textGradient: 'text-teal-300',
    badgeColor: 'bg-teal-500/10 border-teal-500/30 text-teal-300'
  },
  {
    id: 'elsa',
    name: 'Elsa Dinda Fatmasari',
    initials: 'ED',
    roleTitle: 'UX & Human-Centered Design',
    shortDescription: 'Crafting intuitive plant operator experiences, tacit knowledge verification lifecycles, and industrial field tooling interfaces.',
    fullName: 'Elsa Dinda Fatmasari',
    placeAndDateOfBirth: 'Cilegon, April 29, 2006',
    nim: '24010380006',
    faculty: 'Faculty of Engineering and Computer Science',
    university: 'Universitas Muhammadiyah Banten',
    studyProgram: 'Informatics Engineering',
    hobbies: 'watch movies, read books',
    email: 'elsadinda.fatmasari29@gmail.com',
    gradient: 'from-cyan-500 to-indigo-500',
    textGradient: 'text-cyan-300',
    badgeColor: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
  }
];

export const AboutDevsModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();
  const [selectedDevId, setSelectedDevId] = useState<string | null>(null);

  if (activeModal !== 'about_devs') return null;

  const selectedDev = DEVELOPERS.find(d => d.id === selectedDevId) || null;

  const handleClose = () => {
    setSelectedDevId(null);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            {selectedDev ? (
              <button
                onClick={() => setSelectedDevId(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Back to team roster"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">All Developers</span>
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Users className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  {selectedDev ? selectedDev.fullName : 'Meet the Developers'}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[11px] font-mono font-bold">
                  Nexust Team
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedDev ? `${selectedDev.roleTitle} • Full Biodata Profile` : 'The engineering team behind PetroKnow'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {selectedDev ? (
            /* Full Biodata Profile View (FEATURE G) */
            <div className="space-y-6 animate-fade-in">
              {/* Profile Top Banner */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${selectedDev.gradient} p-0.5 shadow-xl shrink-0`}>
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-2xl font-extrabold text-white">
                    {selectedDev.initials}
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-xl font-bold text-slate-100">{selectedDev.fullName}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${selectedDev.badgeColor}`}>
                      {selectedDev.roleTitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {selectedDev.shortDescription}
                  </p>
                  <div className="pt-1 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1.5 sm:gap-4 text-center sm:text-left text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Hash className="w-3.5 h-3.5 text-teal-400" />
                      NIM: {selectedDev.nim}
                    </span>
                    <a
                      href={`mailto:${selectedDev.email}`}
                      className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedDev.email}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Biodata Fields Grid */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Academic & Personal Biodata</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Field 1: Full Name */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Full Name</span>
                    <p className="font-bold text-slate-100 text-sm">{selectedDev.fullName}</p>
                  </div>

                  {/* Field 2: Place & Date of Birth */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-400" />
                      Place & Date of Birth
                    </span>
                    <p className="font-semibold text-slate-200">{selectedDev.placeAndDateOfBirth}</p>
                  </div>

                  {/* Field 3: Student ID (NIM) */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-teal-400" />
                      Student ID (NIM)
                    </span>
                    <p className="font-mono font-bold text-teal-300">{selectedDev.nim}</p>
                  </div>

                  {/* Field 4: Faculty */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-teal-400" />
                      Faculty
                    </span>
                    <p className="font-semibold text-slate-200">{selectedDev.faculty}</p>
                  </div>

                  {/* Field 5: University */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-teal-400" />
                      University
                    </span>
                    <p className="font-semibold text-slate-200">{selectedDev.university}</p>
                  </div>

                  {/* Field 6: Study Program */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-teal-400" />
                      Study Program
                    </span>
                    <p className="font-semibold text-slate-200">{selectedDev.studyProgram}</p>
                  </div>

                  {/* Field 7: Hobbies */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      Hobbies
                    </span>
                    <p className="font-semibold text-slate-200">{selectedDev.hobbies}</p>
                  </div>

                  {/* Field 8: Email */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-teal-400" />
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedDev.email}`}
                      className="font-semibold text-teal-400 hover:text-teal-300 block hover:underline"
                    >
                      {selectedDev.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick switch between other team members */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDevId(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Team Overview</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">View other members:</span>
                  {DEVELOPERS.filter(d => d.id !== selectedDev.id).map(other => (
                    <button
                      key={other.id}
                      onClick={() => setSelectedDevId(other.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-700 text-xs transition-colors"
                    >
                      {other.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 3-Column Team Roster (FEATURE F & G) */
            <>
              {/* Team Header Sub-label */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Nexust Team</span>
                  <span className="text-xs text-slate-400">• 2 Engineering Members</span>
                </div>
                <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                  Click any card to view full student biodata
                </span>
              </div>

              {/* 2 Developer Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEVELOPERS.map((dev) => (
                  <div
                    key={dev.id}
                    onClick={() => setSelectedDevId(dev.id)}
                    className="p-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/50 flex flex-col items-center text-center cursor-pointer transition-all duration-200 group hover:-translate-y-1 hover:shadow-xl shadow-slate-950/50"
                  >
                    {/* Avatar Initials */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${dev.gradient} p-0.5 mb-3 shadow-lg group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-lg font-extrabold text-white">
                        {dev.initials}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                      {dev.name}
                    </h4>
                    <p className={`text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full border ${dev.badgeColor}`}>
                      {dev.roleTitle}
                    </p>
                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                      {dev.shortDescription}
                    </p>

                    {/* View Profile Action Link */}
                    <div className="mt-4 pt-3 border-t border-slate-700/50 w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-teal-400 group-hover:text-teal-300">
                      <span>View Biodata Profile</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Description & Creator Note */}
              <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/40 text-slate-300 text-sm leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Creator Note
                </div>
                <p className="italic text-slate-300">
                  "Built this prototype wholeheartedly to help solve a real problem: knowledge slipping away before it's ever written down. Found a bug or have an idea for a new feature? Reach out to us anytime!"
                </p>
              </div>

              {/* Modal Footer */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

