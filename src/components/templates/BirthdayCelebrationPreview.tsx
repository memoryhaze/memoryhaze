import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Gift, Play, Pause, X, Music, PartyPopper, Cake, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleLyrics = `Verse 1:
Today's the day we celebrate
The wonderful person that you are
With every candle on your cake
You shine just like a star

Chorus:
Happy birthday to you
May all your dreams come true
Another year of magic
Another year of you!

Verse 2:
The memories we've made together
Are gifts that last forever more
Through laughter, joy, and every weather
Each moment I adore

Bridge:
So blow out all your candles bright
And make a wish tonight
'Cause you deserve the very best
On this your special night!`;

interface BirthdayCelebrationPreviewProps {
  onClose: () => void;
  onSelect: () => void;
}

const samplePhotos = [
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=400&fit=crop",
];

const confettiColors = ["#a855f7", "#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#ef4444"];

const Confetti = ({ delay, x }: { delay: number; x: number }) => {
  const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
  const rotation = Math.random() * 360;
  
  return (
    <motion.div
      initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
      animate={{ 
        y: [0, 500],
        x: [0, (Math.random() - 0.5) * 100],
        rotate: [0, rotation + 720],
        opacity: [1, 1, 0]
      }}
      transition={{ 
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: 2
      }}
      className="absolute pointer-events-none w-3 h-3"
      style={{ 
        left: `${x}%`, 
        top: 0,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px'
      }}
    />
  );
};

const Balloon = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ 
      y: [100, -50],
      opacity: [0, 1, 1, 0],
    }}
    transition={{ 
      duration: 8,
      delay,
      repeat: Infinity,
      repeatDelay: 4
    }}
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, bottom: 0 }}
  >
    <div 
      className="w-8 h-10 rounded-full"
      style={{ backgroundColor: color }}
    />
    <div className="w-px h-12 bg-gray-400 mx-auto" />
  </motion.div>
);

export const BirthdayCelebrationPreview = ({ onClose, onSelect }: BirthdayCelebrationPreviewProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const photoInterval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % samplePhotos.length);
    }, 3000);

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
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden"
      onClick={onClose}
    >
      {/* Confetti */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Confetti key={i} delay={i * 0.2} x={Math.random() * 100} />
      ))}

      <motion.div
        initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Balloons */}
        <Balloon delay={0} x={5} color="#a855f7" />
        <Balloon delay={1} x={90} color="#ec4899" />
        <Balloon delay={2} x={15} color="#3b82f6" />
        <Balloon delay={3} x={85} color="#22c55e" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-lg"
        >
          <X className="w-5 h-5 text-purple-700" />
        </button>

        {/* Main content */}
        <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          {/* Header with party elements */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <PartyPopper className="w-8 h-8 text-purple-500" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Cake className="w-10 h-10 text-pink-500" />
              </motion.div>
              <motion.div
                animate={{ rotate: [10, -10, 10] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Gift className="w-8 h-8 text-indigo-500" />
              </motion.div>
            </div>
            
            <motion.h1 
              className="font-display text-5xl md:text-7xl mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Happy Birthday!
            </motion.h1>
            <p className="text-purple-700 text-2xl font-medium">Emily turns 25! 🎉</p>
          </motion.div>

          {/* Photo carousel with fun styling */}
          <div className="relative mb-8">
            <motion.div 
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
              animate={{ rotate: [-1, 1, -1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  src={samplePhotos[currentPhotoIndex]}
                  alt="Memory"
                  initial={{ opacity: 0, scale: 1.2, rotate: 5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Fun overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
              
              {/* Sparkle decorations */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-4 left-4"
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                className="absolute top-4 right-4"
              >
                <Sparkles className="w-6 h-6 text-pink-300" />
              </motion.div>
            </motion.div>

            {/* Photo dots */}
            <div className="flex justify-center gap-2 mt-4">
              {samplePhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhotoIndex(i)}
                  className={`transition-all ${
                    i === currentPhotoIndex 
                      ? "w-8 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "w-3 h-3 rounded-full bg-purple-200 hover:bg-purple-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Birthday message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8 bg-white/50 backdrop-blur rounded-2xl p-6"
          >
            <p className="text-purple-800 text-xl leading-relaxed">
              🎂 Wishing you the most amazing birthday filled with love, laughter, 
              and all your heart desires! May this year bring you endless joy and adventures! 🎈
            </p>
          </motion.div>

          {/* Music player with party styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </motion.button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-900 font-bold">🎵 Your Birthday Song!</span>
                  </div>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="flex items-center gap-1 text-xs text-purple-700 hover:text-purple-800 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {showLyrics ? "Hide Lyrics" : "View Lyrics"}
                  </button>
                </div>
                <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-purple-600 mt-1 font-medium">
                  <span>{Math.floor(progress * 2.8 / 100)}:{String(Math.floor((progress * 2.8) % 60)).padStart(2, '0')}</span>
                  <span>2:48</span>
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
                  <div className="mt-4 pt-4 border-t border-purple-300/50">
                    <pre className="text-sm text-purple-800 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                      {sampleLyrics}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-white/80 backdrop-blur border-t border-purple-200 p-6 flex justify-center gap-4">
          <Button variant="outline" onClick={onClose} className="border-purple-300 text-purple-700 hover:bg-purple-50">
            Close Preview
          </Button>
          <Button 
            onClick={onSelect}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white hover:opacity-90"
          >
            Select This Template
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
