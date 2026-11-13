'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AlbumCard from '@/components/AlbumCard';

import Footer from '../components/Footer';

export default function NewReleases() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchNewReleases = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/api/spotify/new-releases');
            if (!res.ok) throw new Error('Failed to fetch new releases');
            const data = await res.json();
            if (data.albums && data.albums.items) {
                setAlbums(data.albums.items);
            } else {
                setAlbums([]);
            }
        } catch (err) {
            console.error('Error fetching new releases:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewReleases();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col gap-6">
            <div className="max-w-6xl mx-auto w-full flex-1">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="p-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-150">
                        <h1 className="text-4xl font-bold text-green-500 text-balance">Doutify</h1>
                    </Link>
                </div>

                <h2 className="text-2xl font-bold mb-6 text-balance">New Releases</h2>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                                <div className="aspect-square bg-gray-700" />
                                <div className="p-4 space-y-2">
                                    <div className="h-5 bg-gray-700 rounded w-3/4" />
                                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                                    <div className="h-3.5 bg-gray-700 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error || albums.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-300 mb-12">
                        <p className="mb-4">{error ? 'Failed to load new releases.' : 'No new releases found.'}</p>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={fetchNewReleases}
                                className="min-h-[44px] px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Retry
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center min-h-[44px] px-5 py-2.5 bg-green-500 hover:bg-green-600 text-black rounded-lg font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Back to Search
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        {albums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
