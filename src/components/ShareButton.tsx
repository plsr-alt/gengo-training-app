'use client';

import { useState } from 'react';
import { Share2, Check, Link as LinkIcon } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // User cancelled or share failed silently
      }
      return;
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            コピーしました
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            結果をシェア
          </>
        )}
      </button>
      {copied && (
        <div className="absolute left-0 top-full mt-2 flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg">
          <LinkIcon className="h-3 w-3" />
          URLをクリップボードにコピーしました
        </div>
      )}
    </div>
  );
}
