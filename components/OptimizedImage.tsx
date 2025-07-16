import Image from "next/image";
import { useState } from "react";

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

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc("/default-cake.png");
      onError?.();
    }
  };

  // For Vercel, we need to ensure the image path is properly formatted
  const formattedSrc = imgSrc.startsWith("/") ? imgSrc : `/${imgSrc}`;

  return (
    <Image
      src={formattedSrc}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      onError={handleError}
      unoptimized // Disable optimization for Vercel compatibility
    />
  );
}
