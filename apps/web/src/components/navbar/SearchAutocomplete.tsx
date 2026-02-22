import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface SearchAutocompleteProps {
  query: string;
  onSelect: (term: string) => void;
}

const AI_SEARCH_URL = import.meta.env.VITE_AI_SEARCH_URL;
const AI_SEARCH_KEY = import.meta.env.VITE_AI_SEARCH_KEY;

export default function SearchAutocomplete({ query, onSelect }: SearchAutocompleteProps) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query, limit: '5' });
        if (AI_SEARCH_KEY) params.set('key', AI_SEARCH_KEY);

        const res = await fetch(`${AI_SEARCH_URL}/suggest?${params}`, {
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Support both array-of-strings and { suggestions: string[] } shapes
        const items: string[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.suggestions)
          ? data.suggestions
          : [];

        setSuggestions(items.slice(0, 5));
        setOpen(items.length > 0);
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (term: string) => {
    onSelect(term);
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  if (!open && !loading) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
      role="listbox"
      aria-label="Search suggestions"
    >
      {loading ? (
        <div className="px-4 py-3 text-sm text-gray-400">Đang tải...</div>
      ) : (
        suggestions.map((term, i) => (
          <button
            key={i}
            role="option"
            aria-selected={false}
            onClick={() => handleSelect(term)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
          >
            <Search size={14} className="text-gray-400 shrink-0" />
            <span className="truncate">{term}</span>
          </button>
        ))
      )}
    </div>
  );
}
