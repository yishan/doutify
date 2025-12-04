'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AlbumCard from '@/components/AlbumCard';

export default function NewReleases() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewReleases = async () => {
            try {
                const res = await fetch('/api/spotify/new-releases');
                const data = await res.json();
                if (data.albums && data.albums.items) {
                    setAlbums(data.albums.items);
                }
            } catch (error) {
                console.error('Error fetching new releases:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewReleases();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col">
            <div className="max-w-6xl mx-auto w-full flex-1">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="p-4 rounded-lg transition-colors">
                        <h1 className="text-4xl font-bold text-green-500">Doutify</h1>
                    </Link>
                </div>

                <h2 className="text-2xl font-bold mb-6">New Releases</h2>

                {loading ? (
                    <div className="text-center text-green-500">Loading new releases...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        {albums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                )}
            </div>
            <footer className="text-center text-gray-500 py-8 border-t border-gray-800 mt-auto">
                <p>Made by Yishan with Gemini</p>
            </footer>
        </div>
    );
}
