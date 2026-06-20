import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Globe, Award, CloudUpload, FileText, CheckCircle2, Cpu, Key, Lock, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function CandidateProfile() {
  const { user } = useAuth();
  const { candidates } = useApplication();

  const myProfile = candidates.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || candidates[0];

  // Editable fields states
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [portfolio, setPortfolio] = useState('https://jenkins.dev');
  const [github, setGithub] = useState('github.com/sjenkins');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/sjenkins');
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120');
  
  // Skills list state
  const [skillsText, setSkillsText] = useState(myProfile?.skills?.join(', ') || 'React, TypeScript, CSS, Node.js');
  const [skillsList, setSkillsList] = useState<string[]>(myProfile?.skills || ['React', 'TypeScript', 'CSS', 'Node.js']);

  // Change Password Modal States
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Load custom detailed profile details
  React.useEffect(() => {
    const stored = localStorage.getItem('user_detailed_profile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.githubUrl) {
          setGithub(parsed.githubUrl);
        }
        if (parsed.preferredRole) {
          setPortfolio(`https://${parsed.preferredRole.toLowerCase().replace(/[^a-z0-9]/g, '')}.dev`);
        }
        if (parsed.skills) {
          setSkillsText(parsed.skills);
          const splitSkills = parsed.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
          if (splitSkills.length > 0) {
            setSkillsList(splitSkills);
          }
        }
      } catch {}
    }
  }, [myProfile]);

  // Dynamic values
  const appliedJobsCount = React.useMemo(() => {
    const stored = localStorage.getItem('applied_jobs_list');
    let appliedCount = 2; // Default starting count matching submission history
    if (stored) {
      try {
        const list = JSON.parse(stored);
        appliedCount += list.length;
      } catch {}
    }
    return appliedCount;
  }, []);

  const [uploadedFile, setUploadedFile] = useState<string | null>('sarah_jenkins_resume.pdf');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    setUploadedFile(file.name);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast.success('Resume Ingested Successfully', {
            description: 'AI Core updated your profile coordinates and metadata.',
          });
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Update skills list based on comma input
    const parsedSkills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
    setSkillsList(parsedSkills);
    
    // Save to local storage mock
    const updatedProfile = {
      firstName,
      lastName,
      skills: skillsText,
      githubUrl: github,
      profilePic,
    };
    localStorage.setItem('user_detailed_profile', JSON.stringify(updatedProfile));

    toast.success('Profile Updated Successfully', {
      description: 'Your structural data and skills registry have been saved.',
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }
    toast.success('Password Changed successfully', {
      description: 'Your login credentials have been updated.',
    });
    setOldPassword('');
    setNewPassword('');
    setPassModalOpen(false);
  };

  const getUploadLoaderText = () => {
    if (uploadProgress < 30) return 'Reading Ingested PDF...';
    if (uploadProgress < 60) return 'Extracting Technical Keywords...';
    if (uploadProgress < 90) return 'Calculating Match Alignment...';
    return 'Compiling Final Recommendations...';
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 text-left"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Candidate Profile</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Manage your career credentials, link coordinates, and ingest your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Profile Form Fields (Col-span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Personal Credentials</h4>
              <button
                onClick={() => setPassModalOpen(true)}
                className="text-[10px] font-bold text-primaryGlow uppercase tracking-wider font-space hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            </div>
            
            {/* Profile Picture Uploader */}
            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primaryGlow/50 shadow-[0_0_15px_rgba(79,250,240,0.15)] bg-white/5"
                />
                <label className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5 text-primaryGlow" />
                </label>
              </div>
              <div>
                <span className="text-xs font-bold text-white block uppercase tracking-wider font-space">Profile Image</span>
                <span className="text-[10px] text-mutedGray block font-outfit mt-1">Hover image and click to upload customized picture.</span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-white/1 border border-white/5 text-mutedGray rounded-xl py-3 pl-10 pr-4 text-xs cursor-not-allowed font-outfit"
                  />
                </div>
              </div>

              {/* Editable Skills List */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Skills (Comma Separated)</label>
                <div className="relative">
                  <Award className="absolute left-3 top-3.5 w-4 h-4 text-mutedGray" />
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="React, TypeScript, CSS, Node.js..."
                    className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                  />
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Portfolio Site</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                    <input
                      type="text"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">GitHub Path</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">LinkedIn Path</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-primaryGlow text-black font-bold hover:scale-[1.02] text-xs uppercase tracking-wider font-space cursor-pointer transition-all shadow-[0_0_12px_rgba(79,250,240,0.15)]"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Resume Ingestion & Pipeline stats (Col-span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4 font-outfit">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space mb-2">Workspace Metrics</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-mutedGray font-space block">Submissions</span>
                <span className="text-lg font-black text-white font-space mt-1 block">{appliedJobsCount} Applications</span>
              </div>
              
              <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-mutedGray font-space block">Leaderboard Rank</span>
                <span className="text-lg font-black text-[#FFD166] font-space mt-1 block">#0{myProfile?.rank || 1} Position</span>
              </div>
            </div>
          </div>

          {/* Resume Upload Box */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Resume Ingestion</h4>
            
            <div className="relative border border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/1 flex flex-col items-center justify-center gap-4 hover:border-primaryGlow/40 transition-colors group">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={simulateUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {uploading ? (
                <div className="space-y-4 py-4 w-full">
                  <div className="relative w-12 h-12 flex items-center justify-center mx-auto">
                    <div className="absolute inset-0 rounded-full border border-dashed border-primaryGlow/30 animate-spin-slow" />
                    <Cpu className="w-6 h-6 text-primaryGlow animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primaryGlow uppercase tracking-wider font-space block animate-pulse">
                      {getUploadLoaderText()}
                    </span>
                    <span className="text-[10px] text-mutedGray font-outfit mt-1.5 block">
                      {uploadProgress}% processed
                    </span>
                  </div>
                  <div className="h-1.5 w-4/5 bg-white/5 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-primaryGlow transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/25 text-success flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-[180px] mx-auto">{uploadedFile}</span>
                    <span className="text-[9px] text-success font-bold uppercase tracking-wider font-space mt-1 block">Ingested & Indexed</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-mutedGray group-hover:text-primaryGlow group-hover:border-primaryGlow/20 transition-all">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block uppercase tracking-wider font-space">Upload Document</span>
                    <span className="text-[9px] text-mutedGray mt-1 block font-outfit leading-relaxed">PDF or DOCX files parsed automatically.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Competency Card display */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Competencies Registry</h4>
            
            <div className="flex gap-1.5 flex-wrap">
              {skillsList.map((skill, index) => (
                <span
                  key={index}
                  className="text-[9px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-2.5 py-1 rounded-full font-space uppercase"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {passModalOpen && (
          <>
            <div onClick={() => setPassModalOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit z-50 bg-[#071021] border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl text-left"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-5">
                <span className="text-xs font-black uppercase tracking-wider font-space text-white">Update Security Coordinates</span>
                <button onClick={() => setPassModalOpen(false)} className="text-mutedGray hover:text-white transition-colors cursor-pointer text-xs font-bold">Close</button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">New Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primaryGlow text-black font-bold uppercase tracking-wider font-space text-xs rounded-xl hover:scale-[1.01] transition-transform shadow-[0_0_12px_rgba(79,250,240,0.15)] cursor-pointer"
                >
                  Change Password
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
