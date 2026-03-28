"use client";

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    type: "twitter" | "youtube" | "document";
    tags: string[];
    createdAt: string;
    link: string;
  };
  onDelete: () => void;
}

const typeIcons: Record<string, string> = {
  twitter: "𝕏",
  youtube: "▶️",
  document: "📄",
};

export default function ContentCard({ content, onDelete }: ContentCardProps) {
  const date = new Date(content.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeIcons[content.type]}</span>
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {content.title}
          </h3>
        </div>
        <div className="flex gap-2">
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Open link"
          >
            🔗
          </a>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Placeholder area for content preview */}
      <div className="mb-4 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        {content.type === "youtube" && "▶️ Video Preview"}
        {content.type === "twitter" && "Tweet Content"}
        {content.type === "document" && "📄 Document Preview"}
      </div>

      {/* Tags */}
      {content.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {content.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-sm text-blue-600 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Date */}
      <p className="text-sm text-gray-500">Added on {date}</p>
    </div>
  );
}
