'use client';

import React, { useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'gold' | 'info' | 'success';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  isAlert?: boolean;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  options: ConfirmDialogOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const {
    title,
    message,
    confirmText = options.isAlert ? 'ตกลง' : 'ยืนยัน',
    cancelText = 'ยกเลิก',
    variant = 'danger',
    isAlert = false,
  } = options;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case 'gold':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5EE] text-[#C59139] border border-[#E0D0BE] flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const defaultTitle = isAlert
    ? 'แจ้งเตือนระบบ'
    : variant === 'danger'
    ? 'ยืนยันการลบข้อมูล'
    : 'ยืนยันการดำเนินการ';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#2D1B0E]/65 backdrop-blur-xs animate-fadeIn">
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E8DFD5] space-y-4 animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#8C735A] hover:text-[#2D1B0E] hover:bg-[#FAF5EE] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Section */}
        <div className="flex items-start gap-4">
          {renderIcon()}
          <div className="space-y-1.5 flex-1 pr-6">
            <h3 className="font-bold text-base sm:text-lg text-[#2D1B0E] font-serif leading-snug">
              {title || defaultTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C4A3A] font-light leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-end gap-2.5">
          {!isAlert && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 sm:px-5 py-2.5 rounded-xl border border-[#E8DFD5] bg-white hover:bg-[#FAF5EE] text-[#7A6450] text-xs sm:text-sm font-semibold transition-colors"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 ${
              isAlert
                ? 'w-full btn-gold'
                : variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'btn-gold'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
