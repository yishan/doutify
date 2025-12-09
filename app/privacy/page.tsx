import fs from 'fs/promises';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default async function PrivacyPolicy() {
    const filePath = path.join(process.cwd(), 'PRIVACY_POLICY.md');
    const fileContent = await fs.readFile(filePath, 'utf8');

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="prose prose-slate dark:prose-invert lg:prose-lg">
                <ReactMarkdown>{fileContent}</ReactMarkdown>
            </div>
        </div>
    );
}
