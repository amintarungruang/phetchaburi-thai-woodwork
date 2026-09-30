'use client';

import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Smile, 
  Eye, 
  Edit3 
} from 'lucide-react';
import RichTextRenderer from './RichTextRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  required?: boolean;
}

const COMMON_EMOJIS = ['🌟', '🪵', '🏠', '✨', '🙏', '📞', '📍', '🛠️', '🚛', '💯', '🔥', '📌'];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'เขียนรายละเอียด แคปชั่น หรือเรื่องราว...',
  rows = 6,
  label = 'เนื้อหาแคปชั่น (รองรับการจัดรูปแบบตัวหนา/เอียง/ขีดเส้นใต้)',
  required = false,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper: Wrap or insert formatting syntax at cursor
  const applyFormatting = (prefix: string, suffix: string = prefix, defaultPlaceholder = 'ข้อความ') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultPlaceholder;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
    onChange(newText);

    // Restore selection focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  // Helper: Prefix each selected line with bullet or number
  const applyLinePrefix = (prefixType: 'bullet' | 'number' | 'quote') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) {
      const p = prefixType === 'bullet' ? '- ' : prefixType === 'number' ? '1. ' : '> ';
      applyFormatting(p, '', 'ข้อความใหม่');
      return;
    }

    const lines = selectedText.split('\n');
    const formattedLines = lines.map((line, idx) => {
      if (prefixType === 'bullet') return `- ${line.replace(/^[-•]\s*/, '')}`;
      if (prefixType === 'number') return `${idx + 1}. ${line.replace(/^\d+\.\s*/, '')}`;
      if (prefixType === 'quote') return `> ${line.replace(/^>\s*/, '')}`;
      return line;
    });

    const replaced = formattedLines.join('\n');
    const before = value.substring(0, start);
    const after = value.substring(end);

    onChange(`${before}${replaced}${after}`);
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + emoji);
      setShowEmojiPicker(false);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);

    onChange(`${before}${emoji}${after}`);
    setShowEmojiPicker(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#2D1B0E]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center bg-[#FAF5EE] rounded-lg p-0.5 border border-[#E8DFD5]">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                activeTab === 'edit'
                  ? 'bg-white text-[#2D1B0E] shadow-2xs font-semibold'
                  : 'text-[#8C735A] hover:text-[#2D1B0E]'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>แก้ไข</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-[#2D1B0E] shadow-2xs font-semibold'
                  : 'text-[#8C735A] hover:text-[#2D1B0E]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>ตัวอย่างผลลัพธ์</span>
            </button>
          </div>
        </div>
      )}

      {/* Formatting Toolbar (Only in Edit mode) */}
      {activeTab === 'edit' && (
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-t-xl border-b-0">
          <button
            type="button"
            title="ตัวหนา (Bold)"
            onClick={() => applyFormatting('**', '**', 'ข้อความตัวหนา')}
            className="p-1.5 rounded hover:bg-[#FAF0E1] text-[#2D1B0E] transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ตัวเอียง (Italic)"
            onClick={() => applyFormatting('*', '*', 'ข้อความตัวเอียง')}
            className="p-1.5 rounded hover:bg-[#FAF0E1] text-[#2D1B0E] transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ขีดเส้นใต้ (Underline)"
            onClick={() => applyFormatting('<u>', '</u>', 'ข้อความขีดเส้นใต้')}
            className="p-1.5 rounded hover:bg-[#FAF0E1] text-[#2D1B0E] transition-colors"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-[#E0D0BE] mx-1" />

          <button
            type="button"
            title="รายการแบบจุด (Bullet List)"
            onClick={() => applyLinePrefix('bullet')}
            className="p-1.5 rounded hover:bg-[#FAF0E1] text-[#2D1B0E] transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="รายการแบบตัวเลข (Numbered List)"
            onClick={() => applyLinePrefix('number')}
            className="p-1.5 rounded hover:bg-[#FAF0E1] text-[#2D1B0E] transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ข้อความอ้างอิง/คำพูด (Quote)"
            onClick={() => applyLinePrefix('quote')}
            className="p-1.5 rounded hover:bg-[#FAF0E1] text-[#2D1B0E] transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-[#E0D0BE] mx-1" />

          {/* Emoji Trigger */}
          <div className="relative">
            <button
              type="button"
              title="แทรกอีโมจิ (Emoji)"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded hover:bg-[#FAF0E1] text-[#2D1B0E] transition-colors flex items-center gap-0.5"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {showEmojiPicker && (
              <div className="absolute left-0 top-full mt-1 z-30 bg-white p-2 rounded-xl shadow-lg border border-[#E8DFD5] grid grid-cols-6 gap-1 w-48">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-[#FAF5EE] rounded text-base transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor or Preview Area */}
      {activeTab === 'edit' ? (
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-b-xl text-xs sm:text-sm text-[#2D1B0E] focus:outline-none focus:ring-2 focus:ring-[#C59139]/40 transition-all font-sans leading-relaxed resize-y"
        />
      ) : (
        <div className="p-4 bg-white border border-[#E8DFD5] rounded-xl min-h-[140px] max-h-[300px] overflow-y-auto">
          {value.trim() ? (
            <RichTextRenderer content={value} />
          ) : (
            <span className="text-xs text-[#8C735A] italic">ยังไม่มีข้อความตัวอย่าง</span>
          )}
        </div>
      )}
      <div className="text-[11px] text-[#8C735A] flex justify-between">
        <span>เคล็ดลับ: สามารถไฮไลต์ข้อความแล้วกดปุ่ม **B**, *I*, <u>U</u> เพื่อจัดรูปแบบได้ทันที</span>
        <span>{value.length} ตัวอักษร</span>
      </div>
    </div>
  );
}
