import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- TYPES ---
interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle: string;
  images: { src: string; alt: string }[];
}

// --- HERO SECTION COMPONENT ---
export const HeroSection = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ title, subtitle, images, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(Math.floor(images.length / 2));

    const handleNext = React.useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const handlePrev = () => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    React.useEffect(() => {
      const timer = setInterval(() => {
        handleNext();
      }, 4000);
      return () => clearInterval(timer);
    }, [handleNext]);

    return (
      <div
        ref={ref}
        className={cn('relative w-full overflow-hidden bg-background py-12 md:py-20', className)}
        {...props}
      >
        {/* Background Gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.08),transparent_60%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 md:gap-14">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              {subtitle}
            </p>
          </div>

          {/* Main Showcase Section */}
          <div className="relative w-full">
            {/* Carousel Wrapper */}
            <div className="relative mx-auto flex h-[300px] w-full max-w-5xl items-center justify-center md:h-[450px] lg:h-[550px]">
              {images.map((image, index) => {
                const offset = index - currentIndex;
                const total = images.length;
                let pos = (offset + total) % total;
                if (pos > Math.floor(total / 2)) {
                  pos = pos - total;
                }

                const isCenter = pos === 0;
                const isAdjacent = Math.abs(pos) === 1;

                return (
                  <div
                    key={index}
                    className="absolute transition-all duration-700 ease-in-out"
                    style={{
                      width: isCenter ? '55%' : isAdjacent ? '40%' : '30%',
                      height: isCenter ? '100%' : isAdjacent ? '75%' : '55%',
                      transform: `translateX(${pos * 70}%) scale(${isCenter ? 1 : isAdjacent ? 0.88 : 0.75})`,
                      zIndex: isCenter ? 30 : isAdjacent ? 20 : 10,
                      opacity: Math.abs(pos) > 1 ? 0.4 : 1,
                      filter: isCenter ? 'none' : 'brightness(0.5)',
                      visibility: Math.abs(pos) > 1 ? 'hidden' : 'visible',
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full rounded-2xl object-cover shadow-2xl"
                    />
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 z-40 -translate-y-1/2 rounded-full border-border/50 bg-background/60 backdrop-blur-md hover:bg-background/80 md:left-8"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 z-40 -translate-y-1/2 rounded-full border-border/50 bg-background/60 backdrop-blur-md hover:bg-background/80 md:right-8"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

HeroSection.displayName = 'HeroSection';
