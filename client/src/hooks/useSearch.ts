import { useState, useCallback } from 'react';
import { searchTools, Tool } from '@/lib/searchData';

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const performSearch = useCallback((query: string, limit: number = 10) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const results = searchTools(query.trim(), limit);
    setSearchResults(results);
    setShowResults(true);
    setIsSearching(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  }, []);

  const closeResults = useCallback(() => {
    setShowResults(false);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    performSearch,
    clearSearch,
    closeResults,
  };
}