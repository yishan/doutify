'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
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
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 mx-auto md:mx-0 shadow-2xl">
                        {album.images && album.images[0] ? (
                            <Image
                                src={album.images[0].url}
                                alt={album.name}
                                fill
                                className="object-cover rounded-lg"
                                priority
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
