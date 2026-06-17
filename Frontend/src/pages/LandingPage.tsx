import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Workflow from '../components/Workflow';
import Features from '../components/Features';
import BrainShowcase from '../components/BrainShowcase';
import Benefits from '../components/Benefits';
import RecommendationPreview from '../components/RecommendationPreview';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import PortalModal from '../components/PortalModal';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="text-white min-h-screen relative font-sans antialiased">
      {/* Navigation Floating Header */}
      <Navbar onOpenModal={openModal} />
      
      <main>
        {/* Section 2: Cinematic Hero */}
        <Hero onOpenModal={openModal} />

        {/* Section 3: Recruiter Dashboard Preview */}
        <Stats />

        {/* Section 4: How AI Hiring Engine Works Timeline */}
        <Workflow />

        {/* Section 5: Advanced Features & Tilt Cards */}
        <Features />

        {/* Section 6: Neural Recruitment Core Showcase */}
        <BrainShowcase />

        {/* Section 7: Strategic Benefits Panel (Traditional vs AI) */}
        <Benefits />

        {/* Section 8: Live AI Decision Engine Console */}
        <RecommendationPreview />

        {/* Section 9: Final CTA and Transform Section */}
        <CTA onOpenModal={openModal} />
      </main>

      {/* Section 10: Platform Footer */}
      <Footer />

      {/* Section 11: Auth Portal Modal Popup */}
      <PortalModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
