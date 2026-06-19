export type CanvasTab = "detail" | "library" | "sessions" | "settings";

const tabs: Array<{ id: CanvasTab; label: string }> = [
  { id: "detail", label: "Book" },
  { id: "library", label: "Library" },
  { id: "sessions", label: "Sessions" },
  { id: "settings", label: "Settings" },
];

interface CanvasTabsProps {
  activeTab: CanvasTab;
  onChange: (tab: CanvasTab) => void;
}

export default function CanvasTabs({ activeTab, onChange }: CanvasTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Canvas views"
      className="flex gap-0 bg-[--color-panel] px-5 pt-6 pb-0 shrink-0"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "py-1.5 px-3.5 rounded-full text-sm border-0 cursor-pointer transition-all duration-150",
              isActive
                ? "bg-[--color-espresso] text-[--color-parchment] font-medium shadow-sm"
                : "bg-transparent text-[--color-ink-muted] font-normal hover:bg-[--color-ghost-btn] hover:text-[--color-ink]",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
