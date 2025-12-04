'use client';

import Link from 'next/link';
import Footer from '../components/Footer';

interface DiscoverClientProps {
    playlist: any;
    tracks: any[];
    error: string;
}

export default function DiscoverClient({ playlist, tracks, error }: DiscoverClientProps) {
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                <div className="text-red-400 text-xl mb-4">{error}</div>
                <Link href="/" className="text-green-500 hover:text-green-400 font-bold">
                    ← Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col gap-6">
            <div className="max-w-6xl mx-auto w-full flex-1">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors font-bold">
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
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 rounded-lg">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <h1 className="text-5xl md:text-7xl font-bold text-white">{playlist.name}</h1>
                            <p className="text-gray-400 text-lg max-w-2xl" dangerouslySetInnerHTML={{ __html: playlist.description }} />
                            <div className="mt-4">
                                <a
                                    href={playlist.external_urls.spotify}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full transition-colors"
                                >
                                    Open in Spotify
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-700">
                                <th className="p-4 font-semibold w-12">#</th>
                                <th className="p-4 font-semibold">Track</th>
                                <th className="p-4 font-semibold">Album</th>
                                <th className="p-4 font-semibold">Artist</th>
                                <th className="p-4 font-semibold text-right">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks.map((item: any, index: number) => {
                                const track = item.track;
                                if (!track) return null;
                                return (
                                    <tr key={track.id || index} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-gray-500">{index + 1}</td>
                                        <td className="p-4 font-medium text-gray-200 group-hover:text-white">
                                            {track.name}
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {track.album.name}
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {track.artists.map((a: any) => a.name).join(', ')}
                                        </td>
                                        <td className="p-4 text-gray-500 font-mono text-sm text-right">
                                            {formatDuration(track.duration_ms)}
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
