import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DiscoverLoading() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
            <Header />
            <main className="max-w-5xl mx-auto w-full flex-1 px-6 py-10 sm:py-14 animate-pulse">
                <div className="flex flex-col md:flex-row gap-8 mb-12 items-center md:items-end">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-white/[0.05] shrink-0" />
                    <div className="flex-1 space-y-3 w-full max-w-lg">
                        <div className="h-3 w-32 bg-white/[0.06] rounded" />
                        <div className="h-12 w-3/4 bg-white/[0.07] rounded" />
                        <div className="h-4 w-full bg-white/[0.05] rounded" />
                        <div className="h-10 w-36 bg-white/[0.08] rounded-full mt-2" />
                    </div>
                </div>
                <div className="space-y-3 border-t border-white/[0.08] pt-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-14 bg-white/[0.03] rounded-lg" />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
