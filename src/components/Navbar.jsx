import React, { useState, useEffect } from 'react';
import { Bot, Cpu } from 'lucide-react';

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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-navbar py-3 shadow-lg shadow-black/20'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primaryCyan to-secondaryPurple p-[1.5px] group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-[#050816] rounded-[7px] flex items-center justify-center text-primaryCyan group-hover:text-white transition-colors">
              <Cpu className="w-5 h-5 animate-pulse-slow text-primaryCyan" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tight text-white group-hover:text-primaryCyan transition-colors">
            AI <span className="gradient-text-cyan-purple font-black">Recruit</span>
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#hero"
            className="text-mutedGray hover:text-white hover:text-shadow transition-all duration-200"
            id="nav-link-home"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-mutedGray hover:text-white hover:text-shadow transition-all duration-200"
            id="nav-link-features"
          >
            Features
          </a>
          <a
            href="#workflow"
            className="text-mutedGray hover:text-white hover:text-shadow transition-all duration-200"
            id="nav-link-workflow"
          >
            Workflow
          </a>
          <a
            href="#about"
            className="text-mutedGray hover:text-white hover:text-shadow transition-all duration-200"
            id="nav-link-about"
          >
            About
          </a>
        </nav>

        {/* Action Button */}
        <div>
          <button
            onClick={onOpenModal}
            className="relative px-6 py-2 rounded-full font-bold text-sm text-[#050816] bg-primaryCyan overflow-hidden group shadow-[0_0_15px_rgba(0,245,212,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,245,212,0.6)] hover:scale-105 active:scale-95"
            id="navbar-cta-btn"
          >
            <span className="relative z-10 font-extrabold">Get Started</span>
            {/* Gloss hover effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          </button>
        </div>
      </div>
    </header>
  );
}
