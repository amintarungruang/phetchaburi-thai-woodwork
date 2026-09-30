'use client';

import React from 'react';
import { ConfirmDialogProvider } from '@/context/ConfirmDialogContext';
import { LanguageProvider } from '@/context/LanguageContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
    </LanguageProvider>
  );
}
