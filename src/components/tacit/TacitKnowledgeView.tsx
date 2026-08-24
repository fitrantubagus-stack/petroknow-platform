import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lightbulb, Plus, Trash2, CheckCircle2, 
  Sparkles, Layers, ShieldCheck, ArrowRight, User 
} from 'lucide-react';

export const TacitKnowledgeView: React.FC = () => {
  const { equipmentList, addTacitKnowledge, currentUser, setCurrentView, role, tacitPrefill, setTacitPrefill } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Tacit Wisdom' | 'Troubleshooting' | 'Maintenance'>('Tacit Wisdom');
  const [selectedEqId, setSelectedEqId] = useState<string>('EQ-CMP-204');
  const [situation, setSituation] = useState('');
  const [content, setContent] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [tagsInput, setTagsInput] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  // Sync tacitPrefill if arriving from Retirement Campaign
  React.useEffect(() => {
    if (tacitPrefill) {
      if (tacitPrefill.title) setTitle(tacitPrefill.title);
      if (tacitPrefill.situation) setSituation(tacitPrefill.situation);
      if (tacitPrefill.linkedEquipmentIds?.[0]) setSelectedEqId(tacitPrefill.linkedEquipmentIds[0]);
      if (tacitPrefill.category === 'Troubleshooting') setCategory('Troubleshooting');
      else if (tacitPrefill.category === 'Maintenance Guide') setCategory('Maintenance');
      else setCategory('Tacit Wisdom');
      setTagsInput('Retirement_Handover, Veteran_Wisdom, SME_Capture');
    }
  }, [tacitPrefill]);

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleStepChange = (index: number, val: string) => {
    const updated = [...steps];
    updated[index] = val;
    setSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const filteredSteps = steps.filter(s => s.trim().length > 0);
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const newEntry = addTacitKnowledge({
      title: title.trim(),
      category: category === 'Tacit Wisdom' ? 'Tacit' : (category === 'Troubleshooting' ? 'Troubleshooting' : 'Maintenance Guide'),
      situation: situation.trim() || 'Observed during live plant operations.',
      content: content.trim(),
      keySteps: filteredSteps.length > 0 ? filteredSteps : undefined,
      linkedEquipmentIds: [selectedEqId],
      linkedPartNumbers: [],
      tags: parsedTags.length > 0 ? parsedTags : ['Tacit_Wisdom', 'Field_Veteran']
    });

    setSuccessId(newEntry.id);
    setTacitPrefill(null);

    // Reset form
    setTitle('');
    setSituation('');
    setContent('');
    setSteps(['']);
    setTagsInput('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              Capture Tacit Knowledge & Veteran Heuristics
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              KNOWLEDGE PRESERVATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Digitize unwritten field wisdom, sound diagnostics, and operational tricks before retirement or crew turnover.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successId && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
            <div>
              <p className="font-bold">Knowledge Record #{successId} Submitted Successfully!</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Sent to the SME Verification Queue. Once approved, it will be immediately searchable by the AI Assistant.
              </p>
            </div>
          </div>
          {(role === 'sme' || role === 'supervisor') && (
            <button
              onClick={() => setCurrentView('verification')}
              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span>Go to Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Heuristic Title / Operational Trick <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Acoustic Heuristic for Compressor Plate Valve Micro-Leakage"
              className="w-full mt-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Target Equipment */}
          <div>
            <label className="text-xs font-semibold text-slate-300">
              Associated Plant Equipment <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedEqId}
              onChange={(e) => setSelectedEqId(e.target.value)}
              className="w-full mt-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.code} — {eq.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Category Classification</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full mt-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="Tacit Wisdom">Tacit Field Wisdom</option>
              <option value="Troubleshooting">Troubleshooting & Upset Recovery</option>
              <option value="Maintenance">Specialized Maintenance Procedure</option>
            </select>
          </div>
        </div>

        {/* Situation / Context */}
        <div>
          <label className="text-xs font-semibold text-slate-300">
            Operational Situation / Symptom Pattern <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="When does this happen? (e.g. During heavy rain ambient swings, high vibration spikes on cylinder 2)"
            className="w-full mt-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Dynamic Key Steps List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Recommended Procedural Steps</label>
            <button
              type="button"
              onClick={handleAddStep}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-800 text-teal-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  placeholder={`Step ${idx + 1} action (e.g. Inspect suction valve cap temperature with IR thermometer)`}
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Full Narrative Content */}
        <div>
          <label className="text-xs font-semibold text-slate-300">
            Detailed Technical Explanation & Background Heuristic <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Explain why this works, physical phenomena observed, safety cautions, and potential failure modes if ignored..."
            className="w-full mt-1.5 bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold text-slate-300">Tags (Comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. Vibration, Acoustic, Valve, Heuristic, Turnaround"
            className="w-full mt-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Footer info & submit button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Submitting as: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.title})</span>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Submit to Verification Queue</span>
          </button>
        </div>
      </form>
    </div>
  );
};
