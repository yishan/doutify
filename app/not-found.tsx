import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-xl mx-auto">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#1db954] mb-3 font-mono">
                    404 · Not Found
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl text-[#e8e6e3] tracking-tight leading-[1.08] text-balance mb-4">
                    This record is missing from the index.
                </h1>
                <p className="text-sm text-[#8e8e8e] mb-8">
                    The album or route you requested could not be found.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center min-h-[42px] px-5 py-2.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-[#050505] text-sm font-semibold transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Back to Search
                    </Link>
                    <Link
                        href="/new"
                        className="inline-flex items-center min-h-[42px] px-5 py-2.5 rounded-full border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] text-sm text-[#e8e6e3] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                    >
                        Explore New Releases
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
