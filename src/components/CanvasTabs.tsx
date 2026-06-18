export type CanvasTab = "library" | "sessions" | "results" | "detail" | "settings";

const tabs: Array<{ id: CanvasTab; label: string }> = [
  { id: "library", label: "Library" },
  { id: "sessions", label: "Sessions" },
  { id: "results", label: "Current Results" },
  { id: "detail", label: "Book Detail" },
  { id: "settings", label: "Settings" }
];

interface CanvasTabsProps {
  activeTab: CanvasTab;
  onChange: (tab: CanvasTab) => void;
}

export default function CanvasTabs({ activeTab, onChange }: CanvasTabsProps) {
  return (
    <div role="tablist" aria-label="Canvas views" className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
