import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Sparkles, Eye, Edit3, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CreateJob() {
  const { createJob } = useApplication();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState(120000);
  const [salaryMax, setSalaryMax] = useState(160000);
  const [description, setDescription] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Real-time diagnostics metrics
  const [optScore, setOptScore] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [healthScore, setHealthScore] = useState(0);

  // Auto calculate scores based on form completion
  useEffect(() => {
    let completedFields = 0;
    let totalFields = 6;
    
    if (title) completedFields++;
    if (location) completedFields++;
    if (description.length > 50) completedFields++;
    if (requirements.length > 0) completedFields++;
    if (skills.length > 0) completedFields++;
    if (salaryMin && salaryMax) completedFields++;

    const compPercent = Math.round((completedFields / totalFields) * 100);
    setCompletion(compPercent);

    // Calc Optimization Score (based on detail, skills, formatting)
    let score = 30; // base score
    if (title.length > 5) score += 10;
    if (location) score += 10;
    if (description.length > 100) score += 15;
    if (requirements.length >= 3) score += 15;
    if (skills.length >= 4) score += 15;
    if (salaryMax - salaryMin >= 20000) score += 5;
    setOptScore(Math.min(score, 100));

    // Health Score
    setHealthScore(Math.max(score - 8, 10));
  }, [title, location, description, requirements, skills, salaryMin, salaryMax]);

  const addRequirement = () => {
    if (reqInput.trim()) {
      setRequirements((prev) => [...prev, reqInput.trim()]);
      setReqInput('');
    }
  };

  const removeRequirement = (idx: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills((prev) => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handlePublish = async () => {
    if (!title || !description || !location) return;
    
    await createJob({
      title,
      department,
      location,
      description,
      requirements,
      skills,
      status: 'published',
      optimizationScore: optScore,
      healthScore: healthScore,
      completionPercentage: completion,
      missingSkills: optScore < 85 ? ['Docker', 'System Architecture'] : [],
      salaryMin,
      salaryMax,
    });

    navigate('/recruiter/dashboard');
  };

  // AI Suggestions lists
  const getAISuggestions = () => {
    const suggestions = [];
    if (skills.length < 4) {
      suggestions.push("Add technical stacks like 'TypeScript' or 'Go' to boost search index matches.");
    }
    if (description.length < 100) {
      suggestions.push("Increase job description size. AI screening algorithms require detailed context.");
    }
    if (requirements.length < 3) {
      suggestions.push("List at least 3 concrete requirements for candidate match calculations.");
    }
    if (salaryMin < 130000) {
      suggestions.push("Salary minimum is slightly below benchmark parameters ($135k average).");
    }
    if (suggestions.length === 0) {
      suggestions.push("All diagnostic scores indicate optimized parameters. Ready for launch!");
    }
    return suggestions;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Create Job Post</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Combine template editors, real-time index metrics, and AI recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Notion Editor & Live Preview Tabs (Col-span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tab Switcher */}
          <div className="flex gap-2 p-1.5 rounded-xl bg-white/2 border border-white/6 w-fit">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4.5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider font-space flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'edit' ? 'bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/15' : 'text-mutedGray'}`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4.5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider font-space flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'preview' ? 'bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/15' : 'text-mutedGray'}`}
            >
              <Eye className="w-4 h-4" />
              <span>Job Preview</span>
            </button>
          </div>

          <div className="glass-panel border border-white/8 rounded-2xl p-6.5 bg-[#071021]/30 min-h-[480px]">
            {activeTab === 'edit' ? (
              // Form Edit View
              <div className="space-y-6 text-left">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Role Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead Software Architect"
                    className="w-full bg-white/3 border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors"
                  />
                </div>

                {/* Grid Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-[#030712] border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="AI Core">AI Core</option>
                      <option value="Product">Product</option>
                      <option value="Infrastructure">Infrastructure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote, US"
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors"
                    />
                  </div>
                </div>

                {/* Salary Benchmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Salary Floor ($)</label>
                    <input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Salary Ceiling ($)</label>
                    <input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Job Parameters</label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe context requirements, day-to-day metrics, and team stack details..."
                    className="w-full bg-white/3 border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors resize-none font-outfit"
                  />
                </div>

                {/* Skills tags selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Skill tags (Real-time index)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      placeholder="Add tech skills (React, PyTorch...)"
                      className="flex-grow bg-white/3 border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4.5 bg-white/5 border border-white/8 hover:bg-white/10 rounded-xl text-xs font-bold text-white uppercase tracking-wider font-space cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  {/* Active Skills badges */}
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-[9px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-2.5 py-1 rounded-full flex items-center gap-1 font-space uppercase"
                      >
                        <span>{skill}</span>
                        <button onClick={() => removeSkill(skill)} className="hover:text-white shrink-0 cursor-pointer">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements list */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Requirements Checklist</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
                      placeholder="Requirements (e.g. 5 yrs in AI pipelines)"
                      className="flex-grow bg-white/3 border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors"
                    />
                    <button
                      onClick={addRequirement}
                      className="px-4.5 bg-white/5 border border-white/8 hover:bg-white/10 rounded-xl text-xs font-bold text-white uppercase tracking-wider font-space cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="space-y-2.5 mt-4">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex justify-between items-start gap-4 p-2.5 rounded-lg bg-white/2 border border-white/4">
                        <span className="text-xs text-mutedGray font-outfit leading-relaxed">{req}</span>
                        <button onClick={() => removeRequirement(index)} className="text-[10px] text-error hover:text-white shrink-0 cursor-pointer uppercase font-space">Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              // Live Preview Tab
              <div className="space-y-6 text-left">
                <div className="pb-4 border-b border-white/5">
                  <span className="text-[9px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-2.5 py-0.5 rounded font-space uppercase tracking-wider">{department}</span>
                  <h3 className="text-2.5xl font-black text-white font-space mt-2.5 uppercase tracking-wide">{title || 'Untitled Requirement'}</h3>
                  <span className="text-xs text-mutedGray mt-1 block font-outfit">{location || 'No Location Set'} • Salary: ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}</span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Context Description</h4>
                  <p className="text-xs text-mutedGray leading-relaxed font-outfit whitespace-pre-line">
                    {description || 'No description added yet.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Requirements</h4>
                  {requirements.length === 0 ? (
                    <p className="text-xs text-mutedGray font-outfit">No requirements specified.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-2 text-xs text-mutedGray font-outfit">
                      {requirements.map((req, index) => (
                        <li key={index} className="leading-relaxed">{req}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Required Competencies</h4>
                  <div className="flex gap-1.5 flex-wrap">
                    {skills.map((skill, index) => (
                      <span key={index} className="text-[9px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-2.5 py-1 rounded-full font-space uppercase">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostic score dashboard & AI suggestions (Col-span 5) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Diagnostic Stats Widget */}
          <div className="p-6 rounded-2xl glass-panel border border-white/8 bg-[#071021]/30 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primaryGlow animate-pulse" /> Live Analysis
            </h4>

            {/* Scores grids */}
            <div className="grid grid-cols-2 gap-4">
              {/* Optimization Score */}
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col items-center text-center justify-center">
                <span className="text-3xl font-black text-primaryGlow font-space">{optScore}%</span>
                <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space mt-1">Optimization</span>
              </div>
              {/* Health Score */}
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col items-center text-center justify-center">
                <span className="text-3xl font-black text-secondaryGlow font-space">{healthScore}%</span>
                <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space mt-1">Index Health</span>
              </div>
            </div>

            {/* Progress metrics */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div>
                <div className="flex justify-between text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space mb-1">
                  <span>Parameter Completion</span>
                  <span>{completion}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primaryGlow transition-all duration-300" style={{ width: `${completion}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggestions Box */}
          <div className="p-6 rounded-2xl glass-panel border border-white/8 bg-[#071021]/30 space-y-5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">AI Copilot Diagnostic</h4>
            
            <div className="flex flex-col gap-3">
              {getAISuggestions().map((sug, index) => (
                <div key={index} className="flex gap-2.5 items-start p-3 rounded-lg bg-white/2 border border-white/4 text-xs font-outfit text-mutedGray">
                  {optScore >= 90 ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed">{sug}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger Checklist Panel */}
          <div className="p-6 rounded-2xl glass-panel border border-white/8 bg-[#071021]/30 space-y-5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Launch Readiness</h4>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-outfit text-mutedGray">
                <span>Description context added?</span>
                {description.length > 50 ? <CheckCircle2 className="w-4.5 h-4.5 text-success" /> : <AlertTriangle className="w-4.5 h-4.5 text-warning" />}
              </div>
              <div className="flex items-center justify-between text-xs font-outfit text-mutedGray">
                <span>Diagnostic score &gt; 80%?</span>
                {optScore >= 80 ? <CheckCircle2 className="w-4.5 h-4.5 text-success" /> : <AlertTriangle className="w-4.5 h-4.5 text-warning" />}
              </div>
              <div className="flex items-center justify-between text-xs font-outfit text-mutedGray">
                <span>Minimum 3 requirements?</span>
                {requirements.length >= 3 ? <CheckCircle2 className="w-4.5 h-4.5 text-success" /> : <AlertTriangle className="w-4.5 h-4.5 text-warning" />}
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={!title || !description || !location}
              className={`w-full py-4 mt-4 rounded-xl font-bold text-xs uppercase tracking-widest font-space flex items-center justify-center gap-2 transition-all duration-300 relative group overflow-hidden cursor-pointer ${
                (title && description && location)
                  ? 'bg-primaryGlow text-[#030712] shadow-[0_0_20px_rgba(79,250,240,0.3)] hover:shadow-[0_0_35px_rgba(79,250,240,0.5)]'
                  : 'bg-white/5 text-mutedGray cursor-not-allowed border border-white/5'
              }`}
            >
              <span>Publish Workspace</span>
              <ShieldCheck className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
