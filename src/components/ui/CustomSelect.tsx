'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'เลือกรายการ...',
  label,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-[#2D1B0E] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-left transition-all flex items-center justify-between gap-2 shadow-xs focus:outline-none ${
          isOpen
            ? 'border-[#C59139] ring-2 ring-[#C59139]/25'
            : 'border-[#E8DFD5] hover:border-[#C59139]/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate text-[#2D1B0E]">
          {selectedOption?.icon && (
            <span className="shrink-0 text-[#C59139]">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge !== undefined && (
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#A87424] font-bold border border-[#E0D0BE]">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#8C735A] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#C59139]' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#E8DFD5] rounded-2xl shadow-xl overflow-hidden py-1.5 max-h-64 overflow-y-auto animate-fadeIn ${menuClassName}`}
          style={{ minWidth: '100%' }}
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[#8C735A] text-center">
              ไม่มีตัวเลือก
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between gap-2.5 transition-colors ${
                    isSelected
                      ? 'bg-[#FAF5EE] text-[#A87424] font-bold'
                      : 'text-[#2D1B0E] hover:bg-[#FAF0E1]/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {option.icon && (
                      <span
                        className={`shrink-0 ${
                          isSelected ? 'text-[#C59139]' : 'text-[#8C735A]'
                        }`}
                      >
                        {option.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <div className="truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-[11px] text-[#8C735A] font-normal truncate mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {option.badge !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#8C735A] border border-[#E8DFD5]">
                        {option.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#C59139] shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
