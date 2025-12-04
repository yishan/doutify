'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ToastContext';

export default function NewReleases() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchNewReleases = async () => {
            // 500ms delay as requested
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                const res = await fetch('/api/spotify/new-releases');
                if (res.status === 429) {
                    showToast("reach rate limit, retry after 5 minutes");
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                if (data.albums && data.albums.items) {
                    setAlbums(data.albums.items);
                }
            } catch (error) {
                console.error('Failed to fetch new releases:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewReleases();
    }, []);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mb-12">
                <h2 className="text-2xl font-bold mb-4 mt-12 text-white">New Releases</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg h-64 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (albums.length === 0) return null;

    return (
        <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-4 mt-12 text-white">New Releases</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {albums.slice(0, 6).map((album) => (
                    <div key={album.id} className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors flex flex-col">
                        <Link
                            href={`/album/${album.id}`}
                            className="absolute inset-0 z-0"
                        >
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
                        <div className="p-3 flex-1 flex flex-col pointer-events-none">
                            <h3 className="font-bold text-md truncate" title={album.name}>{album.name}</h3>
                            <p className="text-gray-400 text-sm truncate">{album.artists.map((a: any) => a.name).join(', ')}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)} • {album.release_date}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
