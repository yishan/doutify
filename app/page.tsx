'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { SpotifyAlbumSummary } from '@/lib/spotify';
import { getRecentAlbums, clearRecentAlbums } from '@/lib/recentAlbums';
import { getSavedAlbums, clearSavedAlbums } from '@/lib/savedAlbums';
import Header from './components/Header';
import NewReleases from './components/NewReleases';
import Footer from './components/Footer';
import AlbumCard from '@/components/AlbumCard';

const RECENT_STORAGE_KEY = 'doutify_recent_searches';
const SEED_QUERIES = ['Radiohead', 'Nujabes', 'Frank Ocean', 'Ryuichi Sakamoto'];

function extractSpotifyAlbumId(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/open\.spotify\.com\/(?:intl-[a-zA-Z-]+\/)?album\/([a-zA-Z0-9]{22})/);
  if (urlMatch?.[1]) return urlMatch[1];
  const uriMatch = trimmed.match(/^spotify:album:([a-zA-Z0-9]{22})$/);
  if (uriMatch?.[1]) return uriMatch[1];
  return null;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [albums, setAlbums] = useState<SpotifyAlbumSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'album' | 'single'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<SpotifyAlbumSummary[]>([]);
  const [savedAlbums, setSavedAlbums] = useState<SpotifyAlbumSummary[]>([]);
  const prevSearchQRef = useRef(initialQuery);

  const ITEMS_PER_PAGE = 10;

  const toTimestamp = (dateStr?: string) => {
    if (!dateStr) return 0;
    const ts = new Date(dateStr).getTime();
    return Number.isFinite(ts) ? ts : 0;
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((v): v is string => typeof v === 'string').slice(0, 6));
        }
      }
    } catch {
      // Ignore storage errors
    }
    setRecentAlbums(getRecentAlbums());
    setSavedAlbums(getSavedAlbums());
  }, []);

  useEffect(() => {
    if (searchParams.get('focus') === '1') {
      inputRef.current?.focus();
    }
  }, [searchParams]);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (currentQ !== prevSearchQRef.current) {
      prevSearchQRef.current = currentQ;
      if (document.activeElement !== inputRef.current || currentQ === '') {
        setQuery(currentQ);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const trimmed = query.trim();
    const urlQ = (searchParams.get('q') || '').trim();
    if (trimmed.length < 2 || trimmed === urlQ || extractSpotifyAlbumId(trimmed)) return;

    const timer = setTimeout(() => {
      router.replace(`${pathname}?q=${encodeURIComponent(trimmed)}&page=1`, { scroll: false });
    }, 380);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  const performSearch = async (searchQuery: string, page: number, order: 'asc' | 'desc' | null) => {
    if (!searchQuery) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const res = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=${ITEMS_PER_PAGE}&offset=${offset}`
      );
      const data = (await res.json()) as {
        error?: string;
        albums?: { items?: SpotifyAlbumSummary[]; total?: number };
      };

      if (!res.ok || data.error) {
        setAlbums([]);
        setTotalResults(0);
        setError(data.error || 'Failed to fetch search results.');
      } else {
        const items = Array.isArray(data?.albums?.items) ? data.albums.items.filter(Boolean) : [];

        if (order) {
          items.sort((a, b) => {
            const dateA = toTimestamp(a.release_date);
            const dateB = toTimestamp(b.release_date);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
          });
        }

        setAlbums(items);
        setTotalResults(data?.albums?.total ?? items.length);
      }
    } catch {
      setAlbums([]);
      setTotalResults(0);
      setError('Failed to connect to search service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (q) {
      performSearch(q, page, sortOrder);
    } else {
      setAlbums([]);
      setTotalResults(0);
      setError('');
      setHasSearched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const navigateToSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    const params = new URLSearchParams();
    params.set('q', trimmed);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const detectedAlbumId = extractSpotifyAlbumId(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (detectedAlbumId) {
      router.push(`/album/${detectedAlbumId}`);
      return;
    }
    navigateToSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (searchParams.get('q')) {
      router.push(pathname);
    }
    inputRef.current?.focus();
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let newOrder: 'asc' | 'desc' | null = null;
    if (value === 'desc') newOrder = 'desc';
    else if (value === 'asc') newOrder = 'asc';

    setSortOrder(newOrder);

    if (albums.length > 0) {
      if (newOrder === null) {
        const q = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1', 10);
        if (q) performSearch(q, page, null);
      } else {
        const sorted = [...albums].sort((a, b) => {
          const dateA = toTimestamp(a.release_date);
          const dateB = toTimestamp(b.release_date);
          return newOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setAlbums(sorted);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (newPage - 1) * ITEMS_PER_PAGE >= totalResults) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentQ = searchParams.get('q') || '';
  const suggestions = recentSearches.length > 0 ? recentSearches : SEED_QUERIES;
  const filteredAlbums = albums.filter((album) =>
    typeFilter === 'all'
      ? true
      : typeFilter === 'album'
        ? album.album_type === 'album'
        : album.album_type !== 'album'
  );
  const typeFilterOptions: Array<{ value: 'all' | 'album' | 'single'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'album', label: 'Albums' },
    { value: 'single', label: 'Singles & EPs' },
  ];

  return (
    <main className="max-w-5xl mx-auto w-full flex-1 px-6 py-10 sm:py-14">
      <div className={`transition-all duration-300 ${hasSearched ? 'mb-8' : 'mb-14 pt-4 sm:pt-10'}`}>
        {!hasSearched && (
          <div className="text-center max-w-2xl mx-auto mb-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#1db954] mb-3 font-mono">
              Minimalist Music Index
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl text-[#e8e6e3] tracking-tight leading-[1.08] text-balance">
              Find the record behind the sound.
            </h1>
          </div>
        )}

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <label htmlFor="album-search" className="sr-only">
            Search for albums or artists
          </label>
          <div className="relative flex items-center rounded-2xl border border-white/[0.1] bg-white/[0.03] focus-within:border-white/[0.28] focus-within:bg-white/[0.05] transition-all duration-200">
            <svg
              className="w-5 h-5 text-[#8e8e8e] ml-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              id="album-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && query) {
                  e.preventDefault();
                  handleClear();
                }
              }}
              placeholder="Search albums, artists, or catalog titles…"
              className="w-full bg-transparent px-3.5 py-4 text-base text-[#e8e6e3] placeholder:text-[#8e8e8e] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="p-2 text-[#8e8e8e] hover:text-[#e8e6e3] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white rounded-full"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="mr-2 min-h-[38px] px-5 py-2 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-[#050505] text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:bg-white/[0.06] disabled:text-[#8e8e8e] disabled:opacity-100 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shrink-0"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {detectedAlbumId && (
          <div className="max-w-2xl mx-auto mt-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-[#1db954]/30 bg-[#1db954]/10 text-xs text-[#e8e6e3]">
            <span className="truncate">Spotify album link detected</span>
            <button
              type="button"
              onClick={() => router.push(`/album/${detectedAlbumId}`)}
              className="shrink-0 font-semibold text-[#1db954] hover:underline focus-visible:outline-2 focus-visible:outline-white rounded"
            >
              Open Album →
            </button>
          </div>
        )}

        {!hasSearched && (
          <div className="max-w-2xl mx-auto mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[#8e8e8e] mr-1">
              {recentSearches.length > 0 ? 'Recent:' : 'Try:'}
            </span>
            {suggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  navigateToSearch(term);
                }}
                className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.07] hover:border-white/[0.16] text-[#a3a3a3] hover:text-[#e8e6e3] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-white"
              >
                {term}
              </button>
            ))}
            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={handleClearRecent}
                className="px-2.5 py-1 rounded-full text-[#8e8e8e] hover:text-[#e8e6e3] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {!hasSearched && savedAlbums.length > 0 && (
        <section className="max-w-5xl mx-auto w-full pb-8 mb-4 border-b border-white/[0.08]">
          <div className="flex items-baseline justify-between mb-5">
            <div className="flex items-baseline gap-2.5">
              <h2 className="font-serif text-2xl text-[#e8e6e3] tracking-tight">Saved Crate</h2>
              <span className="text-xs font-mono text-[#1db954] tabular-nums">{savedAlbums.length}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                clearSavedAlbums();
                setSavedAlbums([]);
              }}
              className="text-xs text-[#8e8e8e] hover:text-[#e8e6e3] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white rounded"
            >
              Clear saved
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-5 gap-y-6">
            {savedAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {!hasSearched && recentAlbums.length > 0 && (
        <section className="max-w-5xl mx-auto w-full pb-8 mb-4 border-b border-white/[0.08]">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="font-serif text-2xl text-[#e8e6e3] tracking-tight">Recently Viewed</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                clearRecentAlbums();
                setRecentAlbums([]);
              }}
              className="text-xs text-[#8e8e8e] hover:text-[#e8e6e3] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white rounded"
            >
              Clear history
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-5 gap-y-6">
            {recentAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {!hasSearched && <NewReleases />}

      {hasSearched && (totalResults > 0 || albums.length > 0) && (
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="text-[#8e8e8e] text-xs uppercase tracking-wider font-mono tabular-nums">
            {totalResults.toLocaleString()} results for &ldquo;{currentQ}&rdquo;
          </div>

          {albums.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5" role="group" aria-label="Filter result type">
                {typeFilterOptions.map((option) => {
                  const active = typeFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTypeFilter(option.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-white ${
                        active
                          ? 'bg-[#e8e6e3] text-[#050505]'
                          : 'border border-white/[0.1] bg-white/[0.02] text-[#a3a3a3] hover:text-[#e8e6e3] hover:bg-white/[0.06]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-order" className="text-xs text-[#8e8e8e]">
                  Sort
                </label>
                <select
                  id="sort-order"
                  value={sortOrder || ''}
                  onChange={handleSortChange}
                  className="bg-[#0e0e0e] text-[#e8e6e3] text-xs border border-white/[0.1] rounded-full px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <option value="">Relevance</option>
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {hasSearched && loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-5 gap-y-8 mb-12">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-white/[0.05] ring-1 ring-inset ring-white/[0.06]" />
              <div className="pt-3 space-y-2">
                <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {hasSearched && !loading && error && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e0e] p-8 text-center text-red-400 max-w-2xl mx-auto mb-12">
          <p className="mb-4 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => currentQ && performSearch(currentQ, currentPage, sortOrder)}
            className="min-h-[40px] px-5 py-2 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-[#e8e6e3] text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
          >
            Retry
          </button>
        </div>
      )}

      {hasSearched && !loading && !error && albums.length === 0 && (
        <div className="py-16 text-center text-[#8e8e8e] text-base max-w-xl mx-auto">
          No matching albums found for &ldquo;{currentQ}&rdquo;. Try another title or artist.
        </div>
      )}

      {!loading && albums.length > 0 && filteredAlbums.length === 0 && (
        <div className="py-12 text-center text-[#8e8e8e] text-sm max-w-xl mx-auto">
          <p className="mb-4">No {typeFilter === 'album' ? 'albums' : 'singles or EPs'} on this page of results.</p>
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className="min-h-[38px] px-4 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-[#e8e6e3] text-xs font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
          >
            Show All Types
          </button>
        </div>
      )}

      {!loading && filteredAlbums.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-5 gap-y-8 mb-12">
          {filteredAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} currentQ={currentQ} currentPage={currentPage} />
          ))}
        </div>
      )}

      {hasSearched && totalResults > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="min-h-[40px] px-5 py-2 rounded-full border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-sm text-[#e8e6e3] disabled:opacity-35 disabled:cursor-not-allowed transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
          >
            Previous
          </button>
          <span className="px-4 font-mono text-xs text-[#8e8e8e] tabular-nums">
            Page {currentPage}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * ITEMS_PER_PAGE >= totalResults || loading}
            className="min-h-[40px] px-5 py-2 rounded-full border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-sm text-[#e8e6e3] disabled:opacity-35 disabled:cursor-not-allowed transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-sm text-[#8e8e8e]">
            Loading index…
          </div>
        }
      >
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
