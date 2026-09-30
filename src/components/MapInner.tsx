'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Image from 'next/image';
import { InstallationPin } from '@/types';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

interface MapInnerProps {
  pins: InstallationPin[];
  selectedPin: InstallationPin | null;
  onSelectPin: (pin: InstallationPin) => void;
}

// Resizer component to ensure Leaflet recalculates dimensions and loads all tiles
function MapResizer({ selectedPin }: { selectedPin: InstallationPin | null }) {
  const map = useMap();

  useEffect(() => {
    // Initial immediate invalidation
    map.invalidateSize();

    // Sequence of invalidations as CSS and Next.js hydration settle
    const timers = [
      setTimeout(() => map.invalidateSize(), 100),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 600),
      setTimeout(() => map.invalidateSize(), 1200),
      setTimeout(() => map.invalidateSize(), 2000),
    ];

    // Native ResizeObserver on map container
    const container = map.getContainer();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      timers.forEach(clearTimeout);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [map]);

  // Pan smoothly to selected pin if provided
  useEffect(() => {
    if (selectedPin) {
      map.flyTo([selectedPin.lat, selectedPin.lng], Math.max(map.getZoom(), 9), {
        duration: 0.8,
      });
      map.invalidateSize();
    }
  }, [selectedPin, map]);

  return null;
}

// Custom Gold Leaflet Icon
const createGoldIcon = () => {
  return L.divIcon({
    className: 'custom-gold-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #835C16 100%);
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #341F0E;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function MapInner({ pins, selectedPin, onSelectPin }: MapInnerProps) {
  const [icon, setIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    setIcon(createGoldIcon());
  }, []);

  if (!icon) return null;

  return (
    <MapContainer
      center={[13.3, 100.2]}
      zoom={7}
      scrollWheelZoom={false}
      className="w-full h-full rounded-2xl z-0 min-h-[440px] sm:min-h-[500px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        minZoom={5}
        keepBuffer={4}
      />
      <MapResizer selectedPin={selectedPin} />
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={icon}
          eventHandlers={{
            click: () => onSelectPin(pin),
          }}
        >
          <Popup>
            <div className="p-1 max-w-xs text-wood-950 font-sans">
              <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2 bg-wood-900">
                <Image
                  src={pin.image_url}
                  alt={pin.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-[10px] font-bold text-gold-700 uppercase tracking-wide">
                {pin.province} • {pin.category_name_th}
              </div>
              <h4 className="font-bold text-xs text-wood-950 mt-0.5 line-clamp-1">{pin.title}</h4>
              <p className="text-[11px] text-wood-600 mt-1 line-clamp-2">{pin.description}</p>
              <div className="mt-2 pt-2 border-t border-wood-200 flex justify-between items-center text-[10px]">
                <span className="text-wood-500">ปีติดตั้ง: {pin.completed_year}</span>
                <span className="font-semibold text-gold-700">{pin.location_name}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
