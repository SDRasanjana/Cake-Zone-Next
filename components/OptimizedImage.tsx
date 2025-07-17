"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  className = "",
  priority = false,
  sizes,
  quality = 75,
  onError,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Update imgSrc when src prop changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      console.log(`Image failed to load: ${imgSrc}`);
      setHasError(true);
      setImgSrc("/default-cake.png");
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Format image source properly based on type
  const getFormattedSrc = (src: string) => {
    // Handle base64 data URLs (uploaded images) - use as-is
    if (src.startsWith("data:image")) {
      return src;
    }

    // Handle HTTP/HTTPS URLs - use as-is
    if (src.startsWith("http")) {
      return src;
    }

    // Handle relative paths - ensure they start with /
    return src.startsWith("/") ? src : `/${src}`;
  };

  const formattedSrc = getFormattedSrc(imgSrc);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <Image
        src={formattedSrc}
        alt={alt}
        fill={fill}
        className={className}
        priority={priority}
        sizes={sizes}
        quality={quality}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized // Disable optimization for Vercel compatibility
      />
    </div>
  );
}
