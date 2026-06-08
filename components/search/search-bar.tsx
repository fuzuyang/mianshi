import { Loader2, Search } from "lucide-react";
import { FormEvent } from "react";

export function SearchBar({
  value,
  isSearching,
  onChange,
  onSubmit,
}: {
  value: string;
  isSearching: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="sticky top-3 z-10 grid grid-cols-[1.375rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm max-sm:static max-sm:grid-cols-[1.375rem_minmax(0,1fr)]"
      onSubmit={onSubmit}
    >
      <Search size={18} className="text-slate-500" />
      <label className="sr-only" htmlFor="search-input">
        检索
      </label>
      <input
        id="search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        placeholder="检索资产、标签或内容"
      />
      <button
        type="submit"
        disabled={isSearching}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-75 max-sm:col-span-2"
      >
        {isSearching ? (
          <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
        ) : (
          <Search size={17} />
        )}
        <span>{isSearching ? "检索中" : "检索"}</span>
      </button>
    </form>
  );
}
