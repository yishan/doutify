import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import Footer from '../components/Footer';

export default async function PrivacyPolicy() {
    const filePath = path.join(process.cwd(), 'PRIVACY_POLICY.md');
    const fileContent = await fs.readFile(filePath, 'utf8');

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col gap-6">
            <div className="max-w-3xl mx-auto w-full flex-1">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center min-h-[44px] text-gray-300 hover:text-white transition-colors duration-150 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded">
                        ← Home
                    </Link>
                </div>
                <div className="prose prose-invert lg:prose-lg max-w-prose">
                    <ReactMarkdown>{fileContent}</ReactMarkdown>
                </div>
            </div>
            <Footer />
        </div>
    );
}
