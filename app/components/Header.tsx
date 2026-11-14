'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const NAV_ITEMS = [
    { href: '/', label: 'Search' },
    { href: '/new', label: 'New Releases' },
    { href: '/discover', label: 'Playlist' },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const focusSearchInput = () => {
            const searchInput = document.getElementById('album-search') as HTMLInputElement | null;
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            } else {
                router.push('/?focus=1');
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                focusSearchInput();
                return;
            }

            const target = e.target as HTMLElement | null;
            const isTypingField =
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable);
            if (!isTypingField && !e.metaKey && !e.ctrlKey && !e.altKey && e.key === '/') {
                e.preventDefault();
                focusSearchInput();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    const handleSearchShortcut = () => {
        const searchInput = document.getElementById('album-search') as HTMLInputElement | null;
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        } else {
            router.push('/?focus=1');
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded"
                >
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-[#1db954]/80 group-hover:border-[#1db954] transition-colors duration-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1db954]" />
                    </span>
                    <span className="font-serif text-2xl tracking-tight text-[#e8e6e3] group-hover:text-white transition-colors duration-200">
                        Doutify
                    </span>
                </Link>

                <nav aria-label="Primary navigation" className="flex items-center gap-1 sm:gap-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            item.href === '/'
                                ? pathname === '/'
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                                    isActive
                                        ? 'text-[#e8e6e3] bg-white/[0.08]'
                                        : 'text-[#8e8e8e] hover:text-[#e8e6e3] hover:bg-white/[0.04]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        onClick={handleSearchShortcut}
                        aria-label="Focus search (Command+K)"
                        className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.16] text-xs text-[#8e8e8e] hover:text-[#e8e6e3] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        <span>Search</span>
                        <kbd className="font-mono text-[11px] text-[#a3a3a3]">⌘K</kbd>
                    </button>
                </nav>
            </div>
        </header>
    );
}
