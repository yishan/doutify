'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import NewReleases from './components/NewReleases';
import Footer from './components/Footer';
import AlbumCard from '@/components/AlbumCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1');

  const [query, setQuery] = useState(initialQuery);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const ITEMS_PER_PAGE = 10;

  const toTimestamp = (dateStr?: string) => {
    if (!dateStr) return 0;
    const ts = new Date(dateStr).getTime();
    return Number.isFinite(ts) ? ts : 0;
  };

  // Sync query state with URL param if it changes externally (e.g. back button)
  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (currentQ !== query) {
      setQuery(currentQ);
    }
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');

    if (q) {
      performSearch(q, page);
    } else {
      // Clear results if no query
      setAlbums([]);
      setTotalResults(0);
      setError('');
      setHasSearched(false);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, page: number) => {
    if (!searchQuery) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setAlbums([]);
        setTotalResults(0);
        setError(data.error || 'Failed to fetch search results.');
      } else {
        const items = Array.isArray(data?.albums?.items) ? data.albums.items.filter(Boolean) : [];

        // Only sort if a specific order is selected
        if (sortOrder) {
          items.sort((a: any, b: any) => {
            const dateA = toTimestamp(a.release_date);
            const dateB = toTimestamp(b.release_date);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          });
        }

        setAlbums(items);
        // Set total results to the actual total from API
        setTotalResults(data?.albums?.total ?? items.length);
      }
    } catch (err) {
      setAlbums([]);
      setTotalResults(0);
      setError('Failed to connect to search service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    const params = new URLSearchParams(searchParams);
    params.set('q', query);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let newOrder: 'asc' | 'desc' | null = null;

    if (value === 'desc') newOrder = 'desc';
    else if (value === 'asc') newOrder = 'asc';

    setSortOrder(newOrder);

    // Re-sort current albums immediately if we have them
    if (albums.length > 0) {
      if (newOrder === null) {
        // If switching back to relevance, re-fetch current page to restore order.
        const q = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1');
        if (q) performSearch(q, page);
      } else {
        const sorted = [...albums].sort((a: any, b: any) => {
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
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentQ = searchParams.get('q') || '';

  return (
    <div className="max-w-6xl mx-auto w-full flex-1">
      <div className="flex justify-center mb-8">
        <Link href="/" className="p-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-150">
          <h1 className="text-4xl font-bold text-green-500 text-balance">Doutify</h1>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-4 max-w-3xl mx-auto">
        <label htmlFor="album-search" className="sr-only">Search for albums or artists</label>
        <input
          id="album-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for albums or artists…"
          className="flex-1 p-4 rounded-lg bg-gray-800 border border-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus:border-green-500 text-base md:text-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] px-8 py-4 bg-green-500 hover:bg-green-600 text-black rounded-lg font-bold transition-colors transition-transform duration-150 active:scale-[0.96] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {!hasSearched && <NewReleases />}

      {(totalResults > 0 || albums.length > 0) && (
        <div className="flex flex-wrap justify-between items-center gap-3 mb-8 min-h-10 max-w-3xl mx-auto w-full">
          {totalResults > 0 && (
            <div className="text-gray-300 text-sm tabular-nums">
              Total Results: {totalResults.toLocaleString()}
            </div>
          )}

          {albums.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="sort-order" className="text-sm text-gray-300">Sort by:</label>
              <select
                id="sort-order"
                value={sortOrder || ''}
                onChange={handleSortChange}
                className="min-h-[44px] md:min-h-0 bg-gray-800 text-white text-base md:text-sm border border-gray-700 rounded-lg px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus:border-green-500"
              >
                <option value="">Relevance</option>
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          )}
        </div>
      )}

      {hasSearched && !loading && error && (
        <div className="bg-gray-800 rounded-lg p-6 text-center text-red-400 max-w-3xl mx-auto w-full mb-8">
          <p className="mb-4">{error}</p>
          <button
            type="button"
            onClick={() => currentQ && performSearch(currentQ, currentPage)}
            className="min-h-[44px] px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Retry
          </button>
        </div>
      )}

      {hasSearched && !loading && !error && albums.length === 0 && (
        <div className="p-8 text-center text-gray-300 text-xl max-w-3xl mx-auto w-full">
          No matching albums found. Try another album title or artist name.
        </div>
      )}

      {albums.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto w-full">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} currentQ={currentQ} currentPage={currentPage} />
          ))}
        </div>
      )}

      {totalResults > 0 && (
        <div className="flex justify-center items-center gap-4 mb-12">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="min-h-[44px] px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors transition-transform duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Previous
          </button>
          <span className="flex items-center px-4 font-mono text-gray-300 tabular-nums">
            Page {currentPage}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={(currentPage * ITEMS_PER_PAGE) >= totalResults || loading}
            className="min-h-[44px] px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors transition-transform duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col gap-6">
      <Suspense fallback={<div className="text-center text-green-500">Loading search...</div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
