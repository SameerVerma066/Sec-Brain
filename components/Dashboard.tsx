"use client";

import { useEffect, useState } from "react";
import { content, share } from "@/lib/api";
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
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [shareLink, setShareLink] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await content.list();
      setContentList(response.data.content || []);
      filterContent(response.data.content || [], "all");
    } catch (err) {
      console.error("Failed to fetch content:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterContent = (items: ContentItem[], filter: string) => {
    if (filter === "all") {
      setFilteredContent(items);
    } else {
      setFilteredContent(items.filter((item) => item.type === filter));
    }
    setActiveFilter(filter);
  };

  const handleAddContent = async (
    title: string,
    link: string,
    type: "twitter" | "youtube" | "document"
  ) => {
    try {
      await content.create(title, link, type);
      setShowAddModal(false);
      fetchContent();
    } catch (err) {
      console.error("Failed to add content:", err);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await content.delete(id);
      fetchContent();
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
      fetchContent();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleFilter = (filter: string) => {
    filterContent(contentList, filter);
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={handleFilter}
        onLogout={onLogout}
      />

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">All Notes</h1>
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
          ) : filteredContent.length === 0 ? (
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
              {filteredContent.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  onDelete={() => handleDeleteContent(item.id)}
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
