'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import WoodEstimator from '@/components/WoodEstimator';
import FloatingActions from '@/components/FloatingActions';
import SmartChatbot from '@/components/SmartChatbot';
import Footer from '@/components/Footer';

export default function EstimatorPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Estimator Section with compact top clearance */}
      <div className="pt-16 sm:pt-18 flex-1">
        <WoodEstimator />
      </div>

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
