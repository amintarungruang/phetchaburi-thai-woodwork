'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Compass } from 'lucide-react';

interface LocationPickerMapProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
  onLocationFound?: (locationName: string) => void;
}

const DynamicPicker = dynamic(() => import('./LocationPickerMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-72 w-full rounded-2xl bg-wood-100/70 border border-wood-200 flex flex-col items-center justify-center text-wood-600 gap-2">
      <Compass className="w-6 h-6 animate-spin text-gold-600" />
      <span className="text-xs font-medium">กำลังโหลดแผนที่ปักหมุด...</span>
    </div>
  ),
});

export default function LocationPickerMap(props: LocationPickerMapProps) {
  return <DynamicPicker {...props} />;
}
