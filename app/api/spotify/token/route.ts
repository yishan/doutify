import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../lib/spotify';

export async function GET() {
    try {
        const token = await getAccessToken();
        return NextResponse.json({ token });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to get token' }, { status: 500 });
    }
}
