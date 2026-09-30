'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Loader2, Compass } from 'lucide-react';

interface LocationPickerMapInnerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
  onLocationFound?: (locationName: string) => void;
}

// Custom Gold Marker
const createDraggableGoldIcon = () => {
  return L.divIcon({
    className: 'custom-picker-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #F59E0B 0%, #B45309 100%);
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2.5px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
};

// Map click event handler & pan controller
function MapController({
  position,
  setPosition,
  onChange,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const newLat = parseFloat(e.latlng.lat.toFixed(6));
      const newLng = parseFloat(e.latlng.lng.toFixed(6));
      setPosition([newLat, newLng]);
      onChange(newLat, newLng);
      map.panTo([newLat, newLng]);
    },
  });

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const container = map.getContainer();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (ro) ro.disconnect();
    };
  }, [map]);

  useEffect(() => {
    map.flyTo(position, map.getZoom() > 10 ? map.getZoom() : 13, {
      duration: 1.2,
    });
    map.invalidateSize();
  }, [position, map]);

  return null;
}

export default function LocationPickerMapInner({
  lat = 13.1118,
  lng = 99.9486,
  onChange,
  onLocationFound,
}: LocationPickerMapInnerProps) {
  const initialLat = lat || 13.1118;
  const initialLng = lng || 99.9486;

  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const markerRef = useRef<L.Marker>(null);
  const icon = useMemo(() => createDraggableGoldIcon(), []);

  useEffect(() => {
    if (lat && lng && (lat !== position[0] || lng !== position[1])) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          const newLat = parseFloat(newPos.lat.toFixed(6));
          const newLng = parseFloat(newPos.lng.toFixed(6));
          setPosition([newLat, newLng]);
          onChange(newLat, newLng);
        }
      },
    }),
    [onChange]
  );

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowDropdown(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=th&limit=5&addressdetails=1`
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error('Geocoding search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: { display_name: string; lat: string; lon: string }) => {
    const newLat = parseFloat(parseFloat(result.lat).toFixed(6));
    const newLng = parseFloat(parseFloat(result.lon).toFixed(6));
    setPosition([newLat, newLng]);
    onChange(newLat, newLng);

    if (onLocationFound) {
      // Shorten the address name for user convenience
      const parts = result.display_name.split(',');
      const shortName = parts.slice(0, 3).join(',').trim();
      onLocationFound(shortName);
    }

    setShowDropdown(false);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  return (
    <div className="space-y-2.5">
      {/* Search Bar over the Map */}
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-wood-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="🔍 ค้นหาสถานที่ หรือที่อยู่ (เช่น วัดมหาธาตุ เพชรบุรี, อ.ชะอำ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-wood-300 text-xs bg-white text-wood-950 focus:ring-1 focus:ring-gold-500 shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 rounded-xl bg-wood-900 hover:bg-wood-800 text-cream-100 text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>ค้นหา</span>
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full mt-1.5 inset-x-0 bg-white rounded-xl shadow-xl border border-wood-200 z-50 overflow-hidden divide-y divide-wood-100 animate-fadeIn text-xs">
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectLocation(item)}
                className="p-2.5 hover:bg-wood-50 cursor-pointer flex items-start gap-2 text-wood-800 transition-colors"
              >
                <MapPin className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                <div className="line-clamp-2">{item.display_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-wood-300 shadow-inner">
        <MapContainer
          center={position}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={icon}
          />
          <MapController position={position} setPosition={setPosition} onChange={onChange} />
        </MapContainer>
      </div>

      {/* Coordinates Display & Instructions */}
      <div className="p-2.5 rounded-xl bg-wood-50 border border-wood-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 text-wood-950 font-mono">
          <span className="font-semibold text-gold-800">
            📍 Lat: <span className="text-wood-900">{position[0].toFixed(6)}</span>
          </span>
          <span className="font-semibold text-gold-800">
            📍 Lng: <span className="text-wood-900">{position[1].toFixed(6)}</span>
          </span>
        </div>
        <div className="text-[11px] text-wood-600">
          * คลิกบนแผนที่หรือลากหมุดสีส้มทองเพื่อปรับตำแหน่ง
        </div>
      </div>
    </div>
  );
}
