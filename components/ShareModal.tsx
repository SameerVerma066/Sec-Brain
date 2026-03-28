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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Share Your Second Brain</h2>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
          Share your entire collection of notes, documents, tweets, and videos
          with others. They'll be able to import your content into their own
          Second Brain.
        </p>

        {shareLink ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ padding: "1rem", backgroundColor: "#dbeafe", borderRadius: "0.5rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "0.5rem" }}>
                Your share link:
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={fullLink || ""}
                  readOnly
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #7dd3fc",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    fontSize: "0.875rem",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  onClick={handleCopy}
                  className="btn-primary"
                  style={{ color: "#0284c7", backgroundColor: "#dbeafe" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
              {contentCount} items will be shared
            </p>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={onClose} className="btn-cancel" style={{ flex: 1 }}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
              {contentCount} items will be shared
            </p>

            <div className="modal-actions">
              <button onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={loading}
                className="btn-confirm"
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
