import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Workflow from './components/Workflow';
import Features from './components/Features';
import BrainShowcase from './components/BrainShowcase';
import Benefits from './components/Benefits';
import RecommendationPreview from './components/RecommendationPreview';
import CTA from './components/CTA';
import Footer from './components/Footer';
import PortalModal from './components/PortalModal';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="bg-[#050816] text-white min-h-screen relative font-sans antialiased">
      {/* Global Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] bg-secondaryPurple/5 rounded-full filter blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] bg-primaryCyan/5 rounded-full filter blur-[150px]" />
      </div>

      {/* Main Layout Content */}
      <div className="relative z-10">
        <Navbar onOpenModal={openModal} />
        
        <main>
          {/* Section 2: Hero */}
          <Hero onOpenModal={openModal} />

          {/* Section 3: Trust Stats */}
          <Stats />

          {/* Section 4: How AI Works Timeline */}
          <Workflow />

          {/* Section 5: Feature Showcase */}
          <Features />

          {/* Section 6: 3D AI Brain Showcase */}
          <BrainShowcase />

          {/* Section 7: Platform Benefits (Traditional vs AI) */}
          <Benefits />

          {/* Section 8: AI Recommendation Terminal Output */}
          <RecommendationPreview />

          {/* Section 9: Final CTA */}
          <CTA onOpenModal={openModal} />
        </main>

        {/* Section 10: Footer */}
        <Footer />
      </div>

      {/* Section 11: Auth Portal Modal Popup */}
      <PortalModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
