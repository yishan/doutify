import type { Metadata } from 'next';
import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
    title: 'Privacy Policy · Doutify',
};

export default async function PrivacyPolicy() {
    const filePath = path.join(process.cwd(), 'PRIVACY_POLICY.md');
    const fileContent = await fs.readFile(filePath, 'utf8');

    return (
        <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
            <Header />
            <main className="max-w-3xl mx-auto w-full flex-1 px-6 py-10 sm:py-14">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm text-[#8e8e8e] hover:text-[#e8e6e3] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white rounded"
                    >
                        ← Back to Discover
                    </Link>
                </div>
                <article className="prose prose-invert max-w-prose prose-headings:font-serif prose-headings:tracking-tight prose-a:text-[#1db954]">
                    <ReactMarkdown>{fileContent}</ReactMarkdown>
                </article>
            </main>
            <Footer />
        </div>
    );
}
