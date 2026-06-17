import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

export default function Navbar({ onOpenModal }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl transition-all duration-500 rounded-full ${
        isScrolled
          ? 'bg-[#071021]/70 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),_0_0_20px_rgba(124,107,255,0.1)] py-3'
          : 'bg-white/3 backdrop-blur-sm border border-white/5 py-4'
      }`}
    >
      <div className="px-6 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primaryGlow to-secondaryGlow p-[1.5px] group-hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(79,250,240,0.2)] group-hover:shadow-[0_0_20px_rgba(79,250,240,0.4)]">
            <div className="w-full h-full bg-[#030712] rounded-full flex items-center justify-center text-primaryGlow">
              <Cpu className="w-4.5 h-4.5 animate-pulse-slow text-primaryGlow" />
            </div>
          </div>
          <span className="text-lg font-black tracking-tight text-white group-hover:text-primaryGlow transition-colors font-space">
            AI <span className="gradient-text-cyan-purple font-black">Recruit</span>
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider">
          <a
            href="#hero"
            className="text-mutedGray hover:text-white hover:glow-primary-filter transition-all duration-300"
            id="nav-link-home"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-mutedGray hover:text-white hover:glow-primary-filter transition-all duration-300"
            id="nav-link-features"
          >
            Features
          </a>
          <a
            href="#workflow"
            className="text-mutedGray hover:text-white hover:glow-primary-filter transition-all duration-300"
            id="nav-link-workflow"
          >
            Workflow
          </a>
          <a
            href="#technology"
            className="text-mutedGray hover:text-white hover:glow-primary-filter transition-all duration-300"
            id="nav-link-technology"
          >
            Technology
          </a>
          <a
            href="#about"
            className="text-mutedGray hover:text-white hover:glow-primary-filter transition-all duration-300"
            id="nav-link-about"
          >
            About
          </a>
        </nav>

        {/* Action Button */}
        <div>
          <button
            onClick={onOpenModal}
            className="relative px-5 py-2 rounded-full font-bold text-xs text-[#030712] bg-primaryGlow overflow-hidden group shadow-[0_0_15px_rgba(79,250,240,0.3)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(79,250,240,0.6)] hover:scale-105 active:scale-95 cursor-pointer font-space"
            id="navbar-cta-btn"
          >
            <span className="relative z-10 font-extrabold uppercase tracking-wide">Get Started</span>
            {/* Gloss hover effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          </button>
        </div>
      </div>
    </header>
  );
}
