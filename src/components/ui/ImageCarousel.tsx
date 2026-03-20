import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  showThumbnails?: boolean;
  enableHoverSlide?: boolean;
  hoverSlideIntervalMs?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  alt = "Product",
  className = "",
  showThumbnails = true,
  enableHoverSlide = false,
  hoverSlideIntervalMs = 900,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hoverIntervalRef = useRef<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-slate-800 flex items-center justify-center ${className}`}>
        <img src="/placeholder.svg" alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex(index);
  };

  const clearHoverInterval = () => {
    if (hoverIntervalRef.current !== null) {
      window.clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }
  };

  const startHoverSlide = () => {
    if (!enableHoverSlide || images.length <= 1 || hoverIntervalRef.current !== null) {
      return;
    }

    hoverIntervalRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, hoverSlideIntervalMs);
  };

  const stopHoverSlide = () => {
    clearHoverInterval();
    if (enableHoverSlide) {
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    return () => {
      clearHoverInterval();
    };
  }, []);

  return (
    <div className="space-y-2">
      {/* Main Image */}
      <div
        className={`relative overflow-hidden rounded-lg bg-slate-900 ${className}`}
        onMouseEnter={startHoverSlide}
        onMouseLeave={stopHoverSlide}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Navigation Buttons */}
        {images.length > 1 && !enableHoverSlide && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-xs font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => goToIndex(index, e)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-slate-600 hover:border-slate-500"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img src={image} alt={`${alt} ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
