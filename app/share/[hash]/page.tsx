"use client";

import { useEffect, useState } from "react";
import { share } from "@/lib/api";
import ContentCard from "@/components/ContentCard";

interface SharedContent {
  id: string;
  title: string;
  link: string;
  type: "twitter" | "youtube" | "document";
  tags: string[];
  createdAt: string;
}

export default function SharePage({ params }: { params: { hash: string } }) {
  const [username, setUsername] = useState("");
  const [content, setContent] = useState<SharedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSharedBrain = async () => {
      try {
        const response = await share.fetch(params.hash);
        setUsername(response.data.username);
        setContent(response.data.content || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load shared brain"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSharedBrain();
  }, [params.hash]);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: "100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-spinner" style={{ minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
            Share Link Not Found
          </h1>
          <p style={{ color: "#4b5563" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="share-page">
      <div className="share-header">
        <h1 className="share-username">
          🧠 {username}'s Second Brain
        </h1>
        <p className="share-subtitle">
          {content.length} item{content.length !== 1 ? "s" : ""} shared
        </p>
      </div>

      <div>
        {content.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "3rem", paddingBottom: "3rem" }}>
            <p style={{ color: "#9ca3af", fontSize: "1.125rem" }}>
              No content shared yet.
            </p>
          </div>
        ) : (
          <div className="shared-content-grid">
            {content.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
