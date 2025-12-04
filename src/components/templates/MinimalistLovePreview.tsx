import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Play, Pause, X, Music, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MinimalistLovePreviewProps {
  onClose: () => void;
  onSelect: () => void;
}

const samplePhotos = [
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=600&h=400&fit=crop",
];

export const MinimalistLovePreview = ({ onClose, onSelect }: MinimalistLovePreviewProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const photoInterval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % samplePhotos.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 100);

    return () => {
      clearInterval(photoInterval);
      clearInterval(progressInterval);
    };
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-lg"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Main content */}
        <div className="p-8 md:p-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              <span className="text-rose-400 text-sm font-medium tracking-widest uppercase">
                A Gift For You
              </span>
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-gray-800 mb-3">
              Happy Anniversary
            </h1>
            <p className="text-gray-500 text-lg">Sarah & Michael</p>
          </motion.div>

          {/* Photo slideshow */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-8 shadow-xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPhotoIndex}
                src={samplePhotos[currentPhotoIndex]}
                alt="Memory"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Photo counter */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-sm text-gray-600">
              {currentPhotoIndex + 1} / {samplePhotos.length}
            </div>
          </div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <p className="text-gray-600 text-lg italic leading-relaxed max-w-2xl mx-auto">
              "Every moment with you is a treasure. Here's to all our beautiful memories 
              and countless more to come. I love you more than words can say."
            </p>
          </motion.div>

          {/* Music player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-rose-400" />
                  <span className="text-gray-800 font-medium">Your Custom Song</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{Math.floor(progress * 2.4 / 100)}:{String(Math.floor((progress * 2.4) % 60)).padStart(2, '0')}</span>
                  <span>2:24</span>
                </div>
              </div>

              <Volume2 className="w-5 h-5 text-gray-400" />
            </div>
          </motion.div>
        </div>

        {/* Footer actions */}
        <div className="bg-white/80 backdrop-blur border-t border-rose-100 p-6 flex justify-center gap-4">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button variant="hero" onClick={onSelect}>
            Select This Template
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
