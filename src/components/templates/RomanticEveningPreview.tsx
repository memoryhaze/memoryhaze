import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, Play, Pause, X, Music, Heart, Moon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleLyrics = `Verse 1:
Under the moonlit sky tonight
Your eyes shine with a gentle light
In this moment, just us two
My heart beats only for you

Chorus:
You are my starlight, my valentine
Forever and always, you'll be mine
In the darkness, you're my guide
My love for you I cannot hide

Verse 2:
Every rose that blooms in spring
Reminds me of the joy you bring
With every whisper of the breeze
You put my restless heart at ease

Bridge:
Tonight beneath the stars above
I give to you my endless love
Forever yours, forever true
There's no one else but you`;

interface RomanticEveningPreviewProps {
  onClose: () => void;
  onSelect: () => void;
}

const samplePhotos = [
  "https://images.unsplash.com/photo-1529519195486-69d84f0dbf8d?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=400&fit=crop",
];

const StarParticle = ({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0, 1, 0.5, 1, 0],
      scale: [0.8, 1, 0.8],
    }}
    transition={{ 
      duration: 3 + Math.random() * 2,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 2
    }}
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <Star className="text-white/60 fill-white/40" style={{ width: size, height: size }} />
  </motion.div>
);

const FloatingHeart = ({ delay, startX }: { delay: number; startX: number }) => (
  <motion.div
    initial={{ y: "100%", x: 0, opacity: 0 }}
    animate={{ 
      y: "-100%",
      x: [0, 20, -20, 0],
      opacity: [0, 1, 1, 0],
    }}
    transition={{ 
      duration: 8,
      delay,
      repeat: Infinity,
      repeatDelay: 3
    }}
    className="absolute bottom-0 pointer-events-none"
    style={{ left: `${startX}%` }}
  >
    <Heart className="w-4 h-4 text-rose-400/60 fill-rose-400/40" />
  </motion.div>
);

export const RomanticEveningPreview = ({ onClose, onSelect }: RomanticEveningPreviewProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const photoInterval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % samplePhotos.length);
    }, 5000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.4));
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
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Starry background */}
        {Array.from({ length: 30 }).map((_, i) => (
          <StarParticle
            key={i}
            delay={i * 0.2}
            x={Math.random() * 100}
            y={Math.random() * 100}
            size={4 + Math.random() * 8}
          />
        ))}

        {/* Floating hearts */}
        <FloatingHeart delay={0} startX={10} />
        <FloatingHeart delay={2} startX={30} />
        <FloatingHeart delay={4} startX={70} />
        <FloatingHeart delay={6} startX={90} />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Main content */}
        <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh] relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Moon className="w-6 h-6 text-slate-400" />
              </motion.div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  >
                    <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </motion.div>
                ))}
              </div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Moon className="w-6 h-6 text-slate-400" />
              </motion.div>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4">
              Under the Stars
            </h1>
            <p className="text-rose-300/80 text-xl">A Valentine's Gift for My Love</p>
          </motion.div>

          {/* Photo with cinematic transitions */}
          <div className="relative mb-10">
            <motion.div
              className="relative aspect-video rounded-xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 0 60px rgba(244, 63, 94, 0.2)" }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  src={samplePhotos[currentPhotoIndex]}
                  alt="Memory"
                  initial={{ opacity: 0, filter: "brightness(0)" }}
                  animate={{ opacity: 1, filter: "brightness(1)" }}
                  exit={{ opacity: 0, filter: "brightness(0)" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Cinematic bars */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent" />
              
              {/* Vignette */}
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            </motion.div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-3 mt-6">
              {samplePhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhotoIndex(i)}
                  className={`transition-all ${
                    i === currentPhotoIndex 
                      ? "w-8 h-1 rounded-full bg-rose-400" 
                      : "w-1 h-1 rounded-full bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Love message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-10"
          >
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400 mx-auto mb-4" />
            <p className="text-white/80 text-xl italic leading-relaxed max-w-2xl mx-auto">
              "In the quiet of the night, under a blanket of stars, 
              my heart whispers your name. You are my forever, my always, 
              my everything."
            </p>
          </motion.div>

          {/* Music player - dark romantic style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(244, 63, 94, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </motion.button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-rose-400" />
                    <span className="text-white font-medium">Our Love Song</span>
                  </div>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {showLyrics ? "Hide Lyrics" : "View Lyrics"}
                  </button>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>{Math.floor(progress * 4 / 100)}:{String(Math.floor((progress * 4) % 60)).padStart(2, '0')}</span>
                  <span>4:00</span>
                </div>
              </div>
            </div>

            {/* Lyrics Panel */}
            <AnimatePresence>
              {showLyrics && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                      {sampleLyrics}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-black/50 backdrop-blur border-t border-white/10 p-6 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Close Preview
          </Button>
          <Button 
            onClick={onSelect}
            className="bg-gradient-to-r from-rose-500 to-rose-700 text-white hover:opacity-90"
          >
            Select This Template
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
