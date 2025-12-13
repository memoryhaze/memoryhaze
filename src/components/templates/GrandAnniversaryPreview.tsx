import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Play, Pause, X, Music, Crown, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleLyrics = `Verse 1:
Twenty-five golden years have passed us by
Like stars that shimmer across the sky
Through every joy and every tear
You've been my strength year after year

Chorus:
Golden love, forever true
Every day I fall for you
Hand in hand through time we've grown
The greatest love I've ever known

Verse 2:
The memories we've made along the way
Are treasures that will never fade away
Our children's laughter, our shared dreams
Life's even better than it seems

Bridge:
Here's to the years still yet to come
Our love's a song that's never done
Forever golden, forever bright
My love for you burns like eternal light`;

interface GrandAnniversaryPreviewProps {
  onClose: () => void;
  onSelect: () => void;
  variant?: "modal" | "page";
  giftData?: {
    photos?: string[];
    lyrics?: string;
    audioUrl?: string | null;
  };
}

const samplePhotos = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop",
];

const FloatingSparkle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, y: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [-20, -60],
    }}
    transition={{ 
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 3
    }}
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <Sparkles className="w-4 h-4 text-amber-400" />
  </motion.div>
);

export const GrandAnniversaryPreview = ({ onClose, onSelect, variant = "modal", giftData }: GrandAnniversaryPreviewProps) => {
  const effectivePhotos = giftData?.photos && giftData.photos.length ? giftData.photos : samplePhotos;
  const effectiveLyrics = typeof giftData?.lyrics === 'string' && giftData.lyrics.trim().length ? giftData.lyrics : sampleLyrics;
  const audioUrl = giftData?.audioUrl || null;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const photoInterval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % effectivePhotos.length);
    }, 3500);

    const progressInterval = !audioUrl
      ? setInterval(() => {
          setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
        }, 100)
      : null;

    return () => {
      clearInterval(photoInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [audioUrl, isPlaying, effectivePhotos.length]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;

    const handleTimeUpdate = () => {
      const duration = el.duration || 0;
      const pct = duration ? (el.currentTime / duration) * 100 : 0;
      setProgress(Number.isFinite(pct) ? pct : 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('ended', handleEnded);
    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;

    if (isPlaying) {
      const p = el.play();
      if (p && typeof (p as any).catch === 'function') {
        (p as any).catch(() => setIsPlaying(false));
      }
    } else {
      el.pause();
    }
  }, [audioUrl, isPlaying]);

  if (variant === "modal") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Decorative gold border */}
        <div className="absolute inset-0 rounded-2xl border-4 border-amber-300/50 pointer-events-none" />
        
        {/* Floating sparkles */}
        <FloatingSparkle delay={0} x={10} y={20} />
        <FloatingSparkle delay={0.5} x={85} y={15} />
        <FloatingSparkle delay={1} x={15} y={70} />
        <FloatingSparkle delay={1.5} x={90} y={65} />
        <FloatingSparkle delay={2} x={50} y={10} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-lg"
        >
          <X className="w-5 h-5 text-amber-700" />
        </button>

        {/* Main content */}
        <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          {/* Header with gold accents */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div 
              className="inline-flex items-center justify-center mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Crown className="w-8 h-8 text-amber-500" />
            </motion.div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-600 text-sm font-medium tracking-[0.3em] uppercase">
                Celebrating
              </span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-amber-900 mb-3">
              25 Golden Years
            </h1>
            <p className="text-amber-700 text-xl font-light">Together Forever</p>
          </motion.div>

          {/* Photo gallery with elegant frame */}
          <div className="relative mb-8">
            <div className="absolute -inset-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 rounded-2xl opacity-60 blur-sm" />
            <div className="relative aspect-video rounded-xl overflow-hidden bg-amber-100 shadow-2xl border-4 border-amber-200">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  src={effectivePhotos[currentPhotoIndex]}
                  alt="Memory"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Elegant vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-900/10" />

              {/* Photo indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {effectivePhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhotoIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentPhotoIndex 
                        ? "bg-amber-400 w-6" 
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Anniversary message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8 relative"
          >
            <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 left-1/4" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute top-0 right-1/4" />
            <p className="text-amber-800 text-xl italic leading-relaxed max-w-2xl mx-auto font-serif">
              "Twenty-five years of love, laughter, and endless adventures. 
              Every moment with you has been a gift. Here's to forever."
            </p>
          </motion.div>

          {/* Music player with gold styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-6 shadow-xl border-2 border-amber-200"
          >
            {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-900 font-semibold">Our Golden Love Song</span>
                  </div>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {showLyrics ? "Hide Lyrics" : "View Lyrics"}
                  </button>
                </div>
                <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-amber-600 mt-1">
                  <span>{Math.floor(progress * 3 / 100)}:{String(Math.floor((progress * 3) % 60)).padStart(2, '0')}</span>
                  <span>3:00</span>
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
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <pre className="text-sm text-amber-800 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                      {effectiveLyrics}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-t-2 border-amber-200 p-6 flex justify-center gap-4">
          <Button variant="outline" onClick={onClose} className="border-amber-300 text-amber-700 hover:bg-amber-50">
            Close Preview
          </Button>
          <Button variant="gold" onClick={onSelect}>
            Select This Template
          </Button>
        </div>
        </motion.div>
      </motion.div>
    );
  }

  // Page variant
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="pt-28 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Floating sparkles */}
          <div className="relative">
            <FloatingSparkle delay={0} x={10} y={20} />
            <FloatingSparkle delay={0.5} x={85} y={15} />
            <FloatingSparkle delay={1} x={15} y={70} />
            <FloatingSparkle delay={1.5} x={90} y={65} />
            <FloatingSparkle delay={2} x={50} y={10} />
          </div>

          {/* Main content from modal, adapted for page */}
          <div className="p-0 md:p-2">
            {/* Header with gold accents */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <motion.div 
                className="inline-flex items-center justify-center mb-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Crown className="w-8 h-8 text-amber-500" />
              </motion.div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-amber-600 text-sm font-medium tracking-[0.3em] uppercase">
                  Celebrating
                </span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-amber-900 mb-3">
                25 Golden Years
              </h1>
              <p className="text-amber-700 text-xl font-light">Together Forever</p>
            </motion.div>

            {/* Photo gallery */}
            <div className="relative mb-8">
              <div className="absolute -inset-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 rounded-2xl opacity-60 blur-sm" />
              <div className="relative aspect-video rounded-xl overflow-hidden bg-amber-100 shadow-2xl border-4 border-amber-200">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentPhotoIndex}
                    src={effectivePhotos[currentPhotoIndex]}
                    alt="Memory"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-900/10" />
              </div>
            </div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8 relative"
            >
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 left-1/4" />
              <Sparkles className="w-4 h-4 text-amber-300 absolute top-0 right-1/4" />
              <p className="text-amber-800 text-xl italic leading-relaxed max-w-2xl mx-auto font-serif">
                "Twenty-five years of love, laughter, and endless adventures. 
                Every moment with you has been a gift. Here's to forever."
              </p>
            </motion.div>

            {/* Music */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-6 shadow-xl border-2 border-amber-200"
            >
              {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-900 font-semibold">Our Golden Love Song</span>
                    </div>
                    <button
                      onClick={() => setShowLyrics(!showLyrics)}
                      className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      {showLyrics ? "Hide Lyrics" : "View Lyrics"}
                    </button>
                  </div>
                  <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-amber-600 mt-1">
                    <span>{Math.floor(progress * 3 / 100)}:{String(Math.floor((progress * 3) % 60)).padStart(2, '0')}</span>
                    <span>3:00</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showLyrics && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <pre className="text-sm text-amber-800 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">{effectiveLyrics}</pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Footer actions */}
            <div className="flex justify-center gap-4 mt-8">
              <Button variant="outline" onClick={onClose} className="border-amber-300 text-amber-700 hover:bg-amber-50">
                Close
              </Button>
              <Button variant="gold" onClick={onSelect}>Select This Template</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
