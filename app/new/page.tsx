'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SpotifyAlbumSummary } from '@/lib/spotify';
import AlbumCard from '@/components/AlbumCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NewReleasesPage() {
    const [albums, setAlbums] = useState<SpotifyAlbumSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | 'album' | 'single'>('all');

    const fetchNewReleases = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/api/spotify/new-releases');
            if (!res.ok) throw new Error('Failed to fetch new releases');
            const data = (await res.json()) as { albums?: { items?: SpotifyAlbumSummary[] } };
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

    const filteredAlbums = albums.filter((album) =>
        typeFilter === 'all'
            ? true
            : typeFilter === 'album'
              ? album.album_type === 'album'
              : album.album_type !== 'album'
    );

    const filterOptions: Array<{ value: 'all' | 'album' | 'single'; label: string }> = [
        { value: 'all', label: 'All' },
        { value: 'album', label: 'Albums' },
        { value: 'single', label: 'Singles & EPs' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
            <Header />
            <main className="max-w-5xl mx-auto w-full flex-1 px-6 py-10 sm:py-14">
                <div className="mb-10 pb-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#1db954] mb-2 font-mono">
                            Daily Rotation
                        </p>
                        <h1 className="font-serif text-4xl sm:text-5xl text-[#e8e6e3] tracking-tight">
                            New Releases
                        </h1>
                        <p className="text-sm text-[#8e8e8e] mt-2">
                            Recent studio albums and notable releases sourced daily from Spotify.
                        </p>
                    </div>

                    {!loading && !error && albums.length > 0 && (
                        <div className="flex items-center gap-1.5 self-start sm:self-end" role="group" aria-label="Filter release type">
                            {filterOptions.map((option) => {
                                const active = typeFilter === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setTypeFilter(option.value)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-white ${
                                            active
                                                ? 'bg-[#e8e6e3] text-[#050505]'
                                                : 'border border-white/[0.1] bg-white/[0.03] text-[#a3a3a3] hover:text-[#e8e6e3] hover:bg-white/[0.07]'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8 mb-12">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square rounded-xl bg-white/[0.05] ring-1 ring-inset ring-white/[0.06]" />
                                <div className="pt-3 space-y-2">
                                    <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                                    <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error || albums.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e0e] p-10 text-center text-[#a3a3a3] mb-12">
                        <p className="mb-5 text-sm">{error ? 'Failed to load new releases.' : 'No new releases found.'}</p>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={fetchNewReleases}
                                className="min-h-[40px] px-5 py-2 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-[#e8e6e3] text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                            >
                                Retry
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center min-h-[40px] px-5 py-2 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-[#050505] text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                            >
                                Back to Search
                            </Link>
                        </div>
                    </div>
                ) : filteredAlbums.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e0e] p-10 text-center text-[#a3a3a3] mb-12">
                        <p className="mb-4 text-sm">No releases match this category.</p>
                        <button
                            type="button"
                            onClick={() => setTypeFilter('all')}
                            className="min-h-[40px] px-5 py-2 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-[#e8e6e3] text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                        >
                            Show All Releases
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8 mb-12">
                        {filteredAlbums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
