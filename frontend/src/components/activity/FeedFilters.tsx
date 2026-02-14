export type FilterValue = "all" | "transactions" | "activities";

interface FeedFiltersProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
}

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "transactions", label: "Transactions" },
  { value: "activities", label: "Activities" },
];

export function FeedFilters({ activeFilter, onFilterChange }: FeedFiltersProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-[#141414] p-1 sm:inline-flex">
      {filters.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onFilterChange(f.value)}
          className={`flex-1 rounded-md px-3 py-1 text-xs font-medium transition-colors sm:flex-initial ${
            activeFilter === f.value
              ? "bg-[#262626] text-[#fafafa]"
              : "text-[#a1a1aa] hover:text-[#d4d4d8]"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
