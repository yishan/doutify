import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NewReleasesLoading() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
            <Header />
            <main className="max-w-5xl mx-auto w-full flex-1 px-6 py-10 sm:py-14 animate-pulse">
                <div className="mb-10 pb-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div>
                        <div className="h-3 w-28 bg-white/[0.06] rounded mb-3" />
                        <div className="h-10 w-56 bg-white/[0.07] rounded mb-2" />
                        <div className="h-4 w-72 bg-white/[0.04] rounded" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-7 w-12 rounded-full bg-white/[0.06]" />
                        <div className="h-7 w-16 rounded-full bg-white/[0.04]" />
                        <div className="h-7 w-24 rounded-full bg-white/[0.04]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8 mb-12">
                    {[...Array(12)].map((_, i) => (
                        <div key={i}>
                            <div className="aspect-square rounded-xl bg-white/[0.05] ring-1 ring-inset ring-white/[0.06]" />
                            <div className="pt-3 space-y-2">
                                <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
