'use client';

import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) return null;

  // Helper to parse line by line
  const lines = content.split('\n');

  // Simple inline parser for **bold**, *italic*, <u>underline</u>, and URLs
  const parseInline = (text: string): React.ReactNode[] => {
    // Regex tokens: **bold**, *italic*, <u>underline</u>, URLs
    const regex = /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|https?:\/\/[^\s]+)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;

      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-[#2D1B0E]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-[#7A6450]">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return (
          <span key={idx} className="underline underline-offset-2 decoration-[#C59139]">
            {part.slice(3, -4)}
          </span>
        );
      }
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A87424] hover:text-[#8C5D19] underline underline-offset-2 break-all font-medium inline-flex items-center gap-0.5"
          >
            {part.length > 40 ? `${part.slice(0, 37)}...` : part}
          </a>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className={`space-y-1.5 leading-relaxed text-[#4A3828] text-sm ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line -> spacer
        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }

        // Bullet point: "- " or "• "
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[-•]\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="text-[#C59139] text-base leading-none select-none">•</span>
              <div className="flex-1">{parseInline(bulletText)}</div>
            </div>
          );
        }

        // Numbered list: "1. ", "2. "
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="font-bold text-[#C59139] text-xs min-w-[18px] select-none pt-0.5">
                {numMatch[1]}.
              </span>
              <div className="flex-1">{parseInline(numMatch[2])}</div>
            </div>
          );
        }

        // Blockquote: "> "
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={lineIdx}
              className="border-l-3 border-[#C59139] pl-3.5 py-1 my-1 italic bg-[#FAF5EE]/80 rounded-r-lg text-[#5C4837]"
            >
              {parseInline(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Standard paragraph line
        return <p key={lineIdx}>{parseInline(line)}</p>;
      })}
    </div>
  );
}
