import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaGalleryEntry {
  uid: string;
  file: string;
  label?: string;
  position: number;
  disabled: boolean;
  video_content?: {
    video_url: string;
    video_title: string;
  };
}

interface ProductImageCarouselProps {
  images: MediaGalleryEntry[];
}

export default function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImages = images
    .filter(img => !img.disabled)
    .sort((a, b) => a.position - b.position);

  if (activeImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const currentImage = activeImages[currentIndex];
  const baseUrl = import.meta.env.VITE_MEDIA_BASE_URL || 'https://online.mmvietnam.com/media/catalog/product';

  if (!currentImage) {
    return (
      <div className="aspect-square bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === activeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <img
          src={`${baseUrl}${currentImage.file}`}
          alt={currentImage.label || 'Product image'}
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
          loading="eager"
        />

        {/* Navigation Arrows */}
        {activeImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {activeImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {activeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {activeImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {activeImages.map((image, index) => (
            <button
              key={image.uid}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-[#0272BA] ring-2 ring-[#0272BA]/30'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={`${baseUrl}${image.file}`}
                alt={image.label || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-light"
            aria-label="Close lightbox"
          >
            ×
          </button>

          <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${baseUrl}${currentImage.file}`}
              alt={currentImage.label || 'Product image'}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {activeImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
