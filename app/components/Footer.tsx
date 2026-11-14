import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/[0.08] mt-auto">
            <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8e8e8e]">
                <p>
                    Doutify · Made by{' '}
                    <a
                        href="https://yishan.li"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#a3a3a3] hover:text-[#1db954] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
                    >
                        Yishan
                    </a>
                </p>
                <div className="flex items-center gap-5">
                    <Link
                        href="/new"
                        className="hover:text-[#e8e6e3] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
                    >
                        New Releases
                    </Link>
                    <Link
                        href="/discover"
                        className="hover:text-[#e8e6e3] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
                    >
                        Playlist
                    </Link>
                    <Link
                        href="/privacy"
                        className="hover:text-[#e8e6e3] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
                    >
                        Privacy
                    </Link>
                </div>
            </div>
        </footer>
    );
}
