'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [album, setAlbum] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await fetch(`/api/spotify/album/${id}`);
                const data = await res.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setAlbum(data);
                }
            } catch (err) {
                setError('Failed to load album details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-2xl font-bold text-green-500">Loading...</div>
            </div>
        );
    }

    if (error || !album) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                <div className="text-red-400 text-xl mb-4">{error || 'Album not found'}</div>
                <Link href="/" className="text-green-500 hover:text-green-400 font-bold">
                    ← Back to Search
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-block mb-8 text-gray-400 hover:text-white transition-colors">
                    ← Back to Search
                </Link>

                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    <div className="relative w-[300px] h-[300px] flex-shrink-0 mx-auto md:mx-0 shadow-2xl">
                        {album.images && album.images[0] ? (
                            <img
                                src={album.images[0].url}
                                alt={album.name}
                                width={300}
                                height={300}
                                className="object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                                No Cover
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-end text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold mb-2">{album.name}</h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-4">
                            {album.artists.map((a: any) => a.name).join(', ')}
                        </p>
                        <div className="text-sm text-gray-400 space-y-1">
                            <p>
                                <span className="font-semibold text-gray-500">Label:</span> {album.label}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-500">Release Date:</span> {album.release_date}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-500">Popularity:</span> {album.popularity}/100
                            </p>
                            {album.genres && album.genres.length > 0 && (
                                <p>
                                    <span className="font-semibold text-gray-500">Genres:</span> {album.genres.join(', ')}
                                </p>
                            )}
                            <p className="mt-2 text-gray-500">
                                {album.total_tracks} songs • {new Date(album.tracks.items.reduce((acc: number, track: any) => acc + track.duration_ms, 0)).toISOString().substr(11, 8)} duration
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center md:items-start">
                            <a
                                href={album.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.561 1.621.42.3.539.84.24 1.2zm.119-3.3c-3.839-2.28-10.26-2.46-13.98-1.32-.6.181-1.2-.179-1.38-.779-.181-.6.179-1.2.779-1.38 4.32-1.32 11.34-1.08 15.72 1.56.6.36.84 1.02.479 1.62-.36.601-1.02.84-1.62.48z" />
                                </svg>
                                Open in Spotify
                            </a>
                        </div>

                        {album.external_ids && Object.keys(album.external_ids).length > 0 && (
                            <div className="mt-4 p-4 bg-gray-800/30 rounded-lg text-sm text-gray-400 text-left">
                                <h3 className="font-semibold text-gray-500 mb-2 uppercase tracking-wider text-xs">External IDs</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(album.external_ids).map(([key, value]) => (
                                        <div key={key}>
                                            <span className="font-mono text-gray-500 uppercase">{key}:</span> <span className="font-mono text-gray-300">{value as string}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-6 text-green-500">Track List</h2>
                    <div className="space-y-2">
                        {album.tracks.items.map((track: any, index: number) => (
                            <div
                                key={track.id}
                                className="flex items-center p-3 hover:bg-white/5 rounded-lg transition-colors group"
                            >
                                <span className="w-8 text-gray-500 text-right mr-4">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-gray-200 group-hover:text-white">
                                        {track.name}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {track.artists.map((a: any) => a.name).join(', ')}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 ml-4 font-mono">
                                    {new Date(track.duration_ms).toISOString().substr(14, 5)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
