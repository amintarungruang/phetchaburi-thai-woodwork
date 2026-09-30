'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Facebook, Share2 } from 'lucide-react';

interface FacebookEmbedCardProps {
  facebookPostUrl: string;
  title?: string;
  caption?: string;
  previewImage?: string;
  publishedAt?: string;
  authorName?: string;
}

export default function FacebookEmbedCard({
  facebookPostUrl,
  title,
  caption,
  previewImage,
  publishedAt,
  authorName = 'เสี่ยธนท์ ฝาทรงไทย',
}: FacebookEmbedCardProps) {
  const [copied, setCopied] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(facebookPostUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format date if provided
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  // Detect if the input is an iframe embed code
  const isIframeSnippet = facebookPostUrl.includes('<iframe') || facebookPostUrl.includes('src=');
  
  // Extract clean URL if iframe code was pasted
  let cleanUrl = facebookPostUrl.trim();
  if (isIframeSnippet) {
    const srcMatch = facebookPostUrl.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      cleanUrl = srcMatch[1];
    }
  }

  // Extract real Facebook destination link if plugins URL was pasted
  let directPostUrl = cleanUrl;
  if (cleanUrl.includes('href=')) {
    const hrefMatch = cleanUrl.match(/[?&]href=([^&]+)/);
    if (hrefMatch && hrefMatch[1]) {
      try {
        directPostUrl = decodeURIComponent(hrefMatch[1]);
      } catch {}
    }
  }

  // Determine if it is a video/reel or regular post
  const isVideo =
    cleanUrl.includes('/videos/') ||
    cleanUrl.includes('/reel/') ||
    cleanUrl.includes('/watch') ||
    cleanUrl.includes('plugins/video.php');

  // Build official Facebook Embed URL
  const getEmbedSrc = (url: string) => {
    if (url.includes('plugins/post.php') || url.includes('plugins/video.php')) {
      return url;
    }
    if (isVideo) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=true&width=500&t=0`;
    }
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
      url
    )}&show_text=true&width=500`;
  };

  const embedSrc = getEmbedSrc(cleanUrl);

  return (
    <div className="bg-white rounded-3xl border border-[#1877F2]/20 overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col justify-between">
      <div>
        {/* Facebook Card Header */}
        <div className="p-4 bg-linear-to-r from-[#1877F2]/8 via-white to-white border-b border-[#E8DFD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold shadow-xs">
              <Facebook className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#2D1B0E] flex items-center gap-1.5">
                <span>{authorName}</span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white text-[9px] flex items-center justify-center font-bold">
                  ✓
                </span>
              </div>
              <div className="text-[11px] text-[#8C735A] flex items-center gap-1 mt-0.5">
                <span>โพสต์จาก Facebook Official</span>
                {formattedDate && <span>• {formattedDate}</span>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            title="คัดลอกลิงก์โพสต์"
            className="p-2 rounded-xl bg-[#FAF5EE] hover:bg-[#FAF0E1] text-[#8C735A] hover:text-[#2D1B0E] text-xs transition-colors flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copied ? 'คัดลอกแล้ว!' : 'แชร์'}</span>
          </button>
        </div>

        {/* Live Facebook Official Embed Iframe */}
        {!embedError && embedSrc ? (
          <div className="w-full bg-[#FAF7F2] border-b border-[#E8DFD5] overflow-hidden flex items-center justify-center min-h-[380px] relative">
            <iframe
              src={embedSrc}
              width="100%"
              height="450"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              onError={() => setEmbedError(true)}
              className="w-full min-h-[420px] max-w-[500px] mx-auto"
            />
          </div>
        ) : (
          /* Fallback Preview Image if iframe fails or is blocked */
          previewImage && (
            <div className="relative aspect-video sm:aspect-2/1 w-full bg-[#FAF5EE] overflow-hidden">
              <Image
                src={previewImage}
                alt={title || 'Facebook Post Preview'}
                fill
                className="object-cover hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Facebook className="w-3 h-3 fill-current" />
                <span>Facebook Post</span>
              </div>
            </div>
          )
        )}

        {/* Content Details (if provided) */}
        {(title || caption) && (
          <div className="p-4 sm:p-5 space-y-2">
            {title && (
              <h4 className="font-bold text-sm sm:text-base text-[#2D1B0E] leading-snug">
                {title}
              </h4>
            )}
            {caption && (
              <p className="text-xs sm:text-sm text-[#5C4A3A] line-clamp-3 leading-relaxed font-light">
                {caption.replace(/[*_#`<u>]/g, '')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Button: Direct Facebook Link */}
      <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD5]">
        <a
          href={directPostUrl.startsWith('http') ? directPostUrl : `https://${directPostUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all active:scale-98"
        >
          <Facebook className="w-4 h-4 fill-current" />
          <span>เปิดอ่านโพสต์ต้นฉบับบน Facebook</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
        </a>
      </div>
    </div>
  );
}

