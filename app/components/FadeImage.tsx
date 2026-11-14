/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';

interface FadeImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
}

export default function FadeImage({ src, alt, className = '', width, height, loading = 'lazy' }: FadeImageProps) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const loaded = loadedSrc === src;

    useEffect(() => {
        const img = imgRef.current;
        if (img?.complete && img.naturalWidth > 0) {
            const frame = requestAnimationFrame(() => setLoadedSrc(src));
            return () => cancelAnimationFrame(frame);
        }
    }, [src]);

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            onLoad={() => setLoadedSrc(src)}
            onError={() => setLoadedSrc(src)}
            className={`transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                loaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
        />
    );
}
