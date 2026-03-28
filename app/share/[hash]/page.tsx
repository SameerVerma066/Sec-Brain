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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Share Link Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🧠</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {username}'s Second Brain
            </h1>
          </div>
          <p className="text-gray-600">
            {content.length} item{content.length !== 1 ? "s" : ""} shared
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto p-8">
        {content.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-12">
            <p className="text-gray-500 text-lg">No content shared yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
