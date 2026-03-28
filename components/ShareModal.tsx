"use client";

import { useState } from "react";

interface ShareModalProps {
  onClose: () => void;
  onShare: () => void;
  shareLink: string | null;
  contentCount: number;
}

export default function ShareModal({
  onClose,
  onShare,
  shareLink,
  contentCount,
}: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      await onShare();
    } finally {
      setLoading(false);
    }
  };

  const fullLink = shareLink
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareLink}`
    : null;

  const handleCopy = () => {
    if (fullLink) {
      navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Share Your Second Brain
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Share your entire collection of notes, documents, tweets, and videos
          with others. They'll be able to import your content into their own
          Second Brain.
        </p>

        {shareLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Your share link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fullLink || ""}
                  readOnly
                  className="flex-1 px-3 py-2 border border-blue-200 rounded-lg bg-white text-sm font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              {contentCount} items will be shared
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {contentCount} items will be shared
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
              >
                {loading ? "Generating..." : "Share Brain"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
