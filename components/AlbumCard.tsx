import Link from 'next/link';
import type { SpotifyAlbumSummary } from '@/lib/spotify';
import FadeImage from '@/app/components/FadeImage';

interface AlbumCardProps {
    album: SpotifyAlbumSummary;
    currentQ?: string;
    currentPage?: number;
}

const AlbumCard = ({ album, currentQ = '', currentPage = 1 }: AlbumCardProps) => {
    const href = currentQ
        ? `/album/${album.id}?source_q=${encodeURIComponent(currentQ)}&source_page=${currentPage}`
        : `/album/${album.id}`;

    const year = album.release_date ? album.release_date.split('-')[0] : '';
    const artists = (album.artists ?? []).map((a) => a.name).join(', ');
    const isNonAlbum = album.album_type && album.album_type !== 'album';

    return (
        <Link
            href={href}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded-xl"
        >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0e0e0e] ring-1 ring-inset ring-white/[0.08] group-hover:ring-white/[0.2] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
                {album.images && album.images.length > 0 ? (
                    <FadeImage
                        src={album.images[0].url}
                        alt={`Cover art for ${album.name}`}
                        className="object-cover w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#8e8e8e]">
                        No Cover
                    </div>
                )}

                {isNonAlbum && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-wider text-[#e8e6e3]">
                        {album.album_type}
                    </span>
                )}
            </div>

            <div className="pt-3 space-y-0.5">
                <h3
                    className="font-medium text-sm text-[#e8e6e3] group-hover:text-white truncate transition-colors duration-200"
                    title={album.name}
                >
                    {album.name}
                </h3>
                <p className="text-xs text-[#8e8e8e] truncate tabular-nums">
                    {[artists, year].filter(Boolean).join(' · ')}
                </p>
            </div>
        </Link>
    );
};

export default AlbumCard;
