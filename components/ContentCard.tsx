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
  onTagClick?: (tag: string) => void;
}

const typeIcons: Record<string, string> = {
  twitter: "𝕏",
  youtube: "▶️",
  document: "📄",
};

export default function ContentCard({ content, onDelete, onTagClick }: ContentCardProps) {
  const date = new Date(content.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <span>{typeIcons[content.type]}</span>
            {content.title}
          </h3>
        </div>
        <div className="card-actions">
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="card-btn"
            title="Open link"
          >
            🔗
          </a>
          <button
            onClick={onDelete}
            className="card-btn delete"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="card-content">
        {content.type === "youtube" && "▶️ Video Preview"}
        {content.type === "twitter" && "Tweet Content"}
        {content.type === "document" && "📄 Document Preview"}
      </div>

      {content.tags.length > 0 && (
        <div className="card-tags">
          {content.tags.slice(0, 2).map((tag, idx) => (
            onTagClick ? (
              <button
                key={idx}
                className="tag"
                onClick={() => onTagClick(tag)}
                type="button"
              >
                #{tag}
              </button>
            ) : (
              <span key={idx} className="tag">
                #{tag}
              </span>
            )
          ))}
        </div>
      )}

      <div className="card-footer">
        <span>Added on {date}</span>
      </div>
    </div>
  );
}
