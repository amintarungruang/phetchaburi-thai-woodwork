'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ThaiHouseFeature from '@/components/ThaiHouseFeature';
import CraftsmanshipSection from '@/components/CraftsmanshipSection';
import PortfolioGallery from '@/components/PortfolioGallery';
import FactoryFeedSection from '@/components/FactoryFeedSection';
import InteractiveMap from '@/components/InteractiveMap';
import PublicSchedule from '@/components/PublicSchedule';
import FloatingActions from '@/components/FloatingActions';
import SmartChatbot from '@/components/SmartChatbot';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Top Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Thai House Feature */}
      <ThaiHouseFeature />

      {/* Craftsmanship Standards */}
      <CraftsmanshipSection />

      {/* Portfolio Gallery */}
      <PortfolioGallery />

      {/* Factory Feed & Live Updates */}
      <FactoryFeedSection />

      {/* Interactive Map */}
      <InteractiveMap />

      {/* Public Schedule */}
      <PublicSchedule />

      {/* Footer */}
      <Footer />

      {/* Floating 2-Buttons Action */}
      <FloatingActions
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {/* Smart Chatbot Window */}
      <SmartChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </main>
  );
}
