"use client";

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onLogout: () => void;
}

const filters = [
  { id: "all", label: "All Notes", icon: "📋" },
  { id: "twitter", label: "Tweets", icon: "𝕏" },
  { id: "youtube", label: "Videos", icon: "▶️" },
  { id: "document", label: "Documents", icon: "📄" },
  { id: "links", label: "Links", icon: "🔗" },
  { id: "tags", label: "Tags", icon: "#" },
];

export default function Sidebar({
  activeFilter,
  onFilterChange,
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

      <button
        onClick={onLogout}
        className="logout-button"
      >
        Logout
      </button>
    </div>
  );
}
