"use client";

import { useState } from "react";

interface AddContentModalProps {
  onClose: () => void;
  onAdd: (title: string, link: string, type: "twitter" | "youtube" | "document") => void;
}

export default function AddContentModal({ onClose, onAdd }: AddContentModalProps) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<"twitter" | "youtube" | "document">("document");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !link.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await onAdd(title, link, type);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Content</h2>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        {error && (
          <div className="error-box">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Link</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="form-input"
              disabled={loading}
            >
              <option value="document">Document</option>
              <option value="youtube">YouTube</option>
              <option value="twitter">Twitter/X</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-confirm"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
