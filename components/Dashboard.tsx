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

export default function Dashboard() {
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
    fetchContent();
  }, []);

  const handleFilter = (filter: string) => {
    filterContent(contentList, filter);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={handleFilter}
        onLogout={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-semibold transition"
            >
              <span>🔗</span> Share Brain
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-semibold transition"
            >
              <span>➕</span> Add Content
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full">
              <p className="text-gray-500 text-lg">No content yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Add your first content
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
