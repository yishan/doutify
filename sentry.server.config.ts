import * as Sentry from '@sentry/nextjs';

const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

function parseSampleRate(raw: string | undefined): number {
    const rate = Number.parseFloat(raw ?? '');
    return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : DEFAULT_TRACES_SAMPLE_RATE;
}

const dsn = process.env.SENTRY_DSN;

Sentry.init({
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
});
