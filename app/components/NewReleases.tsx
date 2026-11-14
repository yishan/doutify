'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SpotifyAlbumSummary } from '@/lib/spotify';
import AlbumCard from '@/components/AlbumCard';

export default function NewReleases() {
    const [albums, setAlbums] = useState<SpotifyAlbumSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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
            console.error('Failed to fetch new releases:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewReleases();
    }, []);

    if (loading) {
        return (
            <section className="max-w-5xl mx-auto w-full pt-8">
                <div className="flex items-baseline justify-between mb-6">
                    <div className="h-7 w-36 bg-white/[0.06] rounded animate-pulse" />
                    <div className="h-4 w-16 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-square rounded-xl bg-white/[0.05] ring-1 ring-inset ring-white/[0.06]" />
                            <div className="pt-3 space-y-2">
                                <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error || albums.length === 0) {
        return (
            <section className="max-w-5xl mx-auto w-full pt-8">
                <div className="flex items-baseline justify-between mb-6">
                    <h2 className="font-serif text-3xl text-[#e8e6e3] tracking-tight">New Releases</h2>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e0e] p-8 text-center text-[#a3a3a3]">
                    <p className="mb-4 text-sm">
                        {error ? 'Could not load new releases right now.' : 'No new releases available at the moment.'}
                    </p>
                    <button
                        type="button"
                        onClick={fetchNewReleases}
                        className="min-h-[40px] px-5 py-2 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-[#e8e6e3] text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-5xl mx-auto w-full pt-8">
            <div className="flex items-baseline justify-between mb-6">
                <div>
                    <h2 className="font-serif text-3xl text-[#e8e6e3] tracking-tight">New Releases</h2>
                    <p className="text-xs text-[#8e8e8e] mt-1">Fresh albums & curated picks, updated daily</p>
                </div>
                <Link
                    href="/new"
                    className="text-sm text-[#8e8e8e] hover:text-[#1db954] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
                >
                    View all →
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
                {albums.slice(0, 8).map((album) => (
                    <AlbumCard key={album.id} album={album} />
                ))}
            </div>
        </section>
    );
}
