"use client";

import { useEffect, useState } from "react";
import { content, share, tags } from "@/lib/api";
import Sidebar from "./Sidebar";
import ContentCard from "./ContentCard";
import AddContentModal from "./AddContentModal";
import ShareModal from "./ShareModal";

interface ContentItem {
  id: string;
  title: string;
  link: string;
  type: "twitter" | "youtube" | "document";
  tags: string[];
  createdAt: string;
  user?: {
    username: string;
  };
}

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagList, setTagList] = useState<Array<{ tag: string; count: number }>>([]);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      const response = await tags.list();
      setTagList(response.data.tags || []);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  const fetchContent = async (params?: {
    type?: "twitter" | "youtube" | "document";
    tag?: string;
  }) => {
    setLoading(true);
    try {
      const response = await content.list(params);
      setContentList(response.data.content || []);
    } catch (err) {
      console.error("Failed to fetch content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async (
    title: string,
    link: string,
    type: "twitter" | "youtube" | "document"
  ) => {
    try {
      await content.create(title, link, type);
      setShowAddModal(false);
      await Promise.all([
        fetchContent(
          activeTag
            ? { tag: activeTag }
            : activeFilter === "all"
              ? undefined
              : { type: activeFilter as "twitter" | "youtube" | "document" }
        ),
        fetchTags(),
      ]);
    } catch (err) {
      console.error("Failed to add content:", err);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await content.delete(id);
      await Promise.all([
        fetchContent(
          activeTag
            ? { tag: activeTag }
            : activeFilter === "all"
              ? undefined
              : { type: activeFilter as "twitter" | "youtube" | "document" }
        ),
        fetchTags(),
      ]);
    } catch (err) {
      console.error("Failed to delete content:", err);
    }
  };

  const handleShare = async () => {
    try {
      const response = await share.create();
      setShareLink(response.data.hash);
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void Promise.all([fetchContent(), fetchTags()]);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleFilter = (filter: string) => {
    setActiveTag(null);
    setActiveFilter(filter);

    if (filter === "all") {
      void fetchContent();
      return;
    }

    void fetchContent({ type: filter as "twitter" | "youtube" | "document" });
  };

  const handleTagSelect = (tag: string) => {
    setActiveTag(tag);
    setActiveFilter("all");
    void fetchContent({ tag });
  };

  const title = activeTag ? `#${activeTag}` : "All Notes";

  return (
    <div className="dashboard-container">
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={handleFilter}
        tags={tagList}
        activeTag={activeTag}
        onTagSelect={handleTagSelect}
        onLogout={onLogout}
      />

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{title}</h1>
          <div className="header-buttons">
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-secondary"
            >
              <span>🔗</span> Share Brain
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <span>➕</span> Add Content
            </button>
          </div>
        </div>

        <div className="content-area">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : contentList.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No content yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-empty"
              >
                Add your first content
              </button>
            </div>
          ) : (
            <div className="content-grid">
              {contentList.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  onDelete={() => handleDeleteContent(item.id)}
                  onTagClick={handleTagSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddContentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddContent}
        />
      )}

      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onShare={handleShare}
          shareLink={shareLink}
          contentCount={contentList.length}
        />
      )}
    </div>
  );
}
