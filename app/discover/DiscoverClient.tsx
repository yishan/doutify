'use client';

import Link from 'next/link';
import Footer from '../components/Footer';

interface DiscoverClientProps {
    playlist: any;
    tracks: any[];
    error: string;
}

const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

export default function DiscoverClient({ playlist, tracks, error }: DiscoverClientProps) {
    const formatDuration = (ms: number) => {
        const totalSeconds = Math.max(0, Math.round(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                <div className="text-red-400 text-xl mb-4">{error}</div>
                <Link href="/" className="inline-flex items-center min-h-[44px] text-green-400 hover:text-green-300 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded">
                    ← Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col gap-6">
            <div className="max-w-6xl mx-auto w-full flex-1">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="inline-flex items-center min-h-[44px] text-gray-300 hover:text-white transition-colors duration-150 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded">
                        ← Home
                    </Link>
                </div>

                {playlist && (
                    <div className="flex flex-col md:flex-row gap-8 mb-12 items-end">
                        <div className="w-60 h-60 shadow-2xl shrink-0">
                            {playlist.images && playlist.images.length > 0 ? (
                                <img
                                    src={playlist.images[0].url}
                                    alt={playlist.name}
                                    width={240}
                                    height={240}
                                    className="w-full h-full object-cover rounded-lg -outline-offset-1 outline-1 outline-white/10"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 rounded-lg">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <h1 className="text-5xl md:text-7xl font-bold text-white text-balance">{playlist.name}</h1>
                            {playlist.description && (
                                <p className="text-gray-300 text-lg max-w-2xl">
                                    {stripHtmlTags(playlist.description)}
                                </p>
                            )}
                            {playlist.external_urls?.spotify && (
                                <div className="mt-4">
                                    <a
                                        href={playlist.external_urls.spotify}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center min-h-[44px] bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full transition-colors transition-transform duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        Open in Spotify
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-gray-800/50 rounded-xl p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-300 border-b border-gray-700">
                                <th className="p-4 font-semibold w-12">#</th>
                                <th className="p-4 font-semibold">Track</th>
                                <th className="p-4 font-semibold">Album</th>
                                <th className="p-4 font-semibold">Artist</th>
                                <th className="p-4 font-semibold text-right">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks.map((entry: any, index: number) => {
                                const track = entry?.item ?? entry?.track ?? entry;
                                if (!track || !track.name) return null;
                                return (
                                    <tr key={track.id || index} className="hover:bg-white/5 transition-colors duration-150 group">
                                        <td className="p-4 text-gray-400 tabular-nums">{index + 1}</td>
                                        <td className="p-4 font-medium text-gray-200 group-hover:text-white">
                                            {track.name}
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {track.album?.id ? (
                                                <Link href={`/album/${track.album.id}`} className="hover:text-white hover:underline">
                                                    {track.album.name}
                                                </Link>
                                            ) : (
                                                track.album?.name || '—'
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {(track.artists ?? []).map((a: any) => a.name).join(', ')}
                                        </td>
                                        <td className="p-4 text-gray-400 font-mono text-sm text-right tabular-nums">
                                            {formatDuration(track.duration_ms || 0)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </div>
    );
}
