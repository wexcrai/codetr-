"use client";

import { useState, useCallback, useRef } from "react";

export interface SearchResult {
  courses: Array<{ id: string; title: string; slug: string; language: string; icon: string }>;
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    chapter: { course: { slug: string; title: string } };
  }>;
  users: Array<{ id: string; name: string; username: string; image: string; level: number }>;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(value), 300);
    },
    [search]
  );

  const clear = useCallback(() => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  }, []);

  return {
    query,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    handleQueryChange,
    clear,
  };
}
