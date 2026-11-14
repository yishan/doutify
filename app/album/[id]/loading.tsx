import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function AlbumLoading() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
            <Header />
            <main className="max-w-5xl mx-auto w-full flex-1 px-6 py-8 sm:py-12 animate-pulse">
                <div className="h-4 w-28 bg-white/[0.06] rounded mb-8" />
                <div className="flex flex-col md:flex-row gap-8 md:gap-10 mb-10 items-center md:items-end">
                    <div className="w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] bg-white/[0.05] rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-4 w-full">
                        <div className="h-12 bg-white/[0.07] rounded w-3/4 mx-auto md:mx-0" />
                        <div className="h-6 bg-white/[0.05] rounded w-1/2 mx-auto md:mx-0" />
                        <div className="h-4 bg-white/[0.04] rounded w-1/3 mx-auto md:mx-0" />
                        <div className="h-10 bg-white/[0.08] rounded-full w-40 mx-auto md:mx-0" />
                    </div>
                </div>
                <div className="space-y-3 border-t border-white/[0.08] pt-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-11 bg-white/[0.03] rounded-lg" />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
