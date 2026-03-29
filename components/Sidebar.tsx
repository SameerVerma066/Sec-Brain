"use client";

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  tags: Array<{ tag: string; count: number }>;
  activeTag: string | null;
  onTagSelect: (tag: string) => void;
  onLogout: () => void;
}

const filters = [
  { id: "all", label: "All Notes", icon: "📋" },
  { id: "twitter", label: "Tweets", icon: "𝕏" },
  { id: "youtube", label: "Videos", icon: "▶️" },
  { id: "document", label: "Documents", icon: "📄" },
];

export default function Sidebar({
  activeFilter,
  onFilterChange,
  tags,
  activeTag,
  onTagSelect,
  onLogout,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Navigation</h1>
      </div>

      <nav className="sidebar-nav">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`nav-button ${activeFilter === filter.id ? "active" : ""}`}
          >
            <span>{filter.icon}</span> {filter.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-tags-section">
        <h2 className="sidebar-title">Tags</h2>
        <div className="sidebar-tags-list">
          {tags.length === 0 ? (
            <p className="sidebar-empty-tags">No tags yet</p>
          ) : (
            tags.map((item) => (
              <button
                key={item.tag}
                onClick={() => onTagSelect(item.tag)}
                className={`sidebar-tag-button ${activeTag === item.tag ? "active" : ""}`}
              >
                <span>#{item.tag}</span>
                <span className="sidebar-tag-count">{item.count}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <button
        onClick={onLogout}
        className="logout-button"
      >
        Logout
      </button>
    </div>
  );
}
