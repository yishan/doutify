import Link from 'next/link';

interface AlbumCardProps {
    album: any;
    currentQ?: string;
    currentPage?: number;
}

const AlbumCard = ({ album, currentQ = '', currentPage = 1 }: AlbumCardProps) => {
    const href = currentQ
        ? `/album/${album.id}?source_q=${encodeURIComponent(currentQ)}&source_page=${currentPage}`
        : `/album/${album.id}`;

    return (
        <div className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700/80 focus-within:ring-2 focus-within:ring-white/80 transition-colors duration-150 h-full flex flex-col">
            <Link
                href={href}
                className="absolute inset-0 z-0 focus:outline-none"
            >
                <span className="sr-only">View details for {album.name}</span>
            </Link>
            <div className="relative aspect-square pointer-events-none">
                {album.images && album.images.length > 0 ? (
                    <img
                        src={album.images[0].url}
                        alt={`Cover art for ${album.name}`}
                        className="object-cover w-full h-full -outline-offset-1 outline-1 outline-white/10 transition-transform duration-150 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                        No Cover
                    </div>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col pointer-events-none">
                <h2 className="font-bold text-lg truncate" title={album.name}>{album.name}</h2>
                <p className="text-gray-300 truncate">{album.artists.map((a: any) => a.name).join(', ')}</p>
                {album.genres && album.genres.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                        {album.genres.join(', ')}
                    </p>
                )}
                <p className="text-sm text-gray-400 mt-2 tabular-nums">
                    {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)} • {album.release_date.split('-')[0]} • {album.total_tracks} {album.total_tracks === 1 ? 'song' : 'songs'}
                </p>
            </div>
        </div>
    );
};

export default AlbumCard;
