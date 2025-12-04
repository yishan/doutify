'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const ITEMS_PER_PAGE = 16;
  const MAX_RESULTS = 100;

  const searchAlbums = async (e?: React.FormEvent, page = 1) => {
    if (e) e.preventDefault();
    if (!query) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      const data = await res.json();

      if (data.error) {
        setAlbums([]);
        setTotalResults(0);
      } else {
        let items = data.albums.items;

        // Only sort if a specific order is selected
        if (sortOrder) {
          items.sort((a: any, b: any) => {
            const dateA = new Date(a.release_date).getTime();
            const dateB = new Date(b.release_date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          });
        }

        setAlbums(items);
        // Cap total results at 100
        setTotalResults(Math.min(data.albums.total, MAX_RESULTS));
        setCurrentPage(page);
      }
    } catch (err) {
      setAlbums([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
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
        searchAlbums(undefined, currentPage);
      } else {
        const sorted = [...albums].sort((a: any, b: any) => {
          const dateA = new Date(a.release_date).getTime();
          const dateB = new Date(b.release_date).getTime();
          return newOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setAlbums(sorted);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (newPage - 1) * ITEMS_PER_PAGE >= totalResults) return;
    searchAlbums(undefined, newPage);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1">
        <h1 className="text-4xl font-bold mb-8 text-center text-green-500">Doutify</h1>

        <form onSubmit={(e) => searchAlbums(e, 1)} className="flex gap-4 mb-4 max-w-3xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for albums or artists..."
            className="flex-1 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-500 text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Search'}
          </button>
        </form>

        <div className="flex justify-between items-center mb-8 h-10">
          {totalResults > 0 && (
            <div className="text-gray-400 text-sm">
              Total Results: {totalResults.toLocaleString()}
            </div>
          )}

          {albums.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sortOrder || ''}
                onChange={handleSortChange}
                className="bg-gray-800 text-white text-sm border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              >
                <option value="">Relevance</option>
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          )}
        </div>

        {hasSearched && !loading && albums.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-xl">
            No result
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {albums.map((album) => (
            <div key={album.id} className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors h-full flex flex-col">
              <Link href={`/album/${album.id}`} className="absolute inset-0 z-0">
                <span className="sr-only">View details for {album.name}</span>
              </Link>
              <div className="relative aspect-square pointer-events-none">
                {album.images && album.images.length > 0 ? (
                  <img
                    src={album.images[0].url}
                    alt={`Cover art for ${album.name}`}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                    No Cover
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col pointer-events-none">
                <h2 className="font-bold text-lg truncate" title={album.name}>{album.name}</h2>
                <p className="text-gray-400 truncate">{album.artists.map((a: any) => a.name).join(', ')}</p>
                {album.genres && album.genres.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {album.genres.join(', ')}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)} • {album.release_date.split('-')[0]} • {album.total_tracks} {album.total_tracks === 1 ? 'song' : 'songs'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {totalResults > 0 && (
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="flex items-center px-4 font-mono text-gray-400">
              Page {currentPage}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={(currentPage * ITEMS_PER_PAGE) >= totalResults || loading}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <footer className="text-center text-gray-500 py-8 border-t border-gray-800 mt-auto">
        <p>Made by Yishan with Gemini</p>
      </footer>
    </div>
  );
}
