import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { INITIAL_USERS } from '../../data/initialData';
import { X, ShieldCheck, Wrench, Microscope, CheckCircle2, ArrowRight, UserCircle2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { activeModal, closeModal, role, setRole, setCurrentView } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>(role);
  const [nameInput, setNameInput] = useState<string>('');

  if (activeModal !== 'login_role') return null;

  const handleSelectRole = (r: Role) => {
    setSelectedRole(r);
  };

  const handleConfirmLogin = () => {
    setRole(selectedRole);
    closeModal();
    setCurrentView('dashboard');
  };

  const rolesConfig: {
    id: Role;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    borderClass: string;
    badgeClass: string;
    permissions: string[];
  }[] = [
    {
      id: 'operator',
      title: 'Plant Operator / Technician',
      subtitle: INITIAL_USERS.operator.name,
      description: 'Field execution role needing fast, verified SOPs, live QR/barcode scanning, and conversational troubleshooting directly at the machine.',
      icon: <Wrench className="w-6 h-6 text-teal-400" />,
      colorClass: 'bg-teal-500/10 text-teal-300',
      borderClass: 'border-teal-500/40 hover:border-teal-400',
      badgeClass: 'bg-teal-500/20 text-teal-300',
      permissions: ['Ask AI Knowledge Assistant', 'Scan Equipment QR & Parts', 'View Digital Twin Map', 'Read-Only Document Library']
    },
    {
      id: 'sme',
      title: 'SME / Senior Engineer',
      subtitle: INITIAL_USERS.sme.name,
      description: 'Subject Matter Expert contributing veteran tacit knowledge, digitizing paper SOP archives, and resolving technical knowledge gaps.',
      icon: <Microscope className="w-6 h-6 text-cyan-400" />,
      colorClass: 'bg-cyan-500/10 text-cyan-300',
      borderClass: 'border-cyan-500/40 hover:border-cyan-400',
      badgeClass: 'bg-cyan-500/20 text-cyan-300',
      permissions: ['Everything in Operator', 'Submit Tacit Knowledge', 'Document Scanner & OCR Ingestion', 'Technical Drafts Management']
    },
    {
      id: 'supervisor',
      title: 'Supervisor / Knowledge Manager',
      subtitle: INITIAL_USERS.supervisor.name,
      description: 'Operations manager maintaining knowledge quality, approving pending SOPs in Verification Queue, and renewing aging knowledge freshness.',
      icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />,
      colorClass: 'bg-indigo-500/10 text-indigo-300',
      borderClass: 'border-indigo-500/40 hover:border-indigo-400',
      badgeClass: 'bg-indigo-500/20 text-indigo-300',
      permissions: ['Full Access to All Features', 'Verification Queue Approvals', 'Re-Verify Aging Knowledge', 'Live Analytics & Audit Logs']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-teal-400">Enterprise Access Portal</span>
            <h3 className="text-xl font-bold text-slate-100">Select Your Role to Continue</h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Optional Name Input */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
            <UserCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Operator / Engineer Name (e.g. Bayu Pratama)"
              className="bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
            <span className="text-[11px] text-slate-400 shrink-0 px-2 py-0.5 rounded bg-slate-700/50">Internal Auth</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Choose Active Role Profile</p>
            <div className="grid grid-cols-1 gap-3">
              {rolesConfig.map((item) => {
                const isSelected = selectedRole === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectRole(item.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? `bg-slate-800/90 ${item.borderClass} ring-2 ring-teal-500/40 shadow-lg shadow-teal-500/10`
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${item.colorClass} shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeClass}`}>
                              {item.id.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {item.permissions.map((perm, idx) => (
                              <span key={idx} className="text-[10px] text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded border border-slate-600/40">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pt-1">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-teal-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <p className="text-xs text-slate-400">
            Current Persona: <strong className="text-slate-200">{INITIAL_USERS[selectedRole].name}</strong>
          </p>
          <button
            onClick={handleConfirmLogin}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-teal-500/25"
          >
            <span>Enter PetroKnow Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
