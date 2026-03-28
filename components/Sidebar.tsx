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
    <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl font-bold">🧠</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Second Brain</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              activeFilter === filter.id
                ? "bg-purple-50 text-purple-600 border-l-4 border-purple-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition"
      >
        Logout
      </button>
    </div>
  );
}
