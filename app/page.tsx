'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchAlbums = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    setAlbums([]);

    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setAlbums(data.albums.items);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-green-500">Spotify Album Search</h1>

        <form onSubmit={searchAlbums} className="flex gap-4 mb-12">
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
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="p-4 mb-8 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                <p className="text-sm text-gray-500 mt-2">{album.release_date} • {album.total_tracks} tracks</p>
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <span className="text-green-400 text-sm font-medium group-hover:underline">
                    View Details
                  </span>
                  <a
                    href={album.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-500 hover:text-white relative z-10 pointer-events-auto"
                    title="Open in Spotify"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.561 1.621.42.3.539.84.24 1.2zm.119-3.3c-3.839-2.28-10.26-2.46-13.98-1.32-.6.181-1.2-.179-1.38-.779-.181-.6.179-1.2.779-1.38 4.32-1.32 11.34-1.08 15.72 1.56.6.36.84 1.02.479 1.62-.36.601-1.02.84-1.62.48z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
