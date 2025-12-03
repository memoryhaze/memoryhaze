import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import {
  Calendar,
  Music,
  Upload,
  ChevronRight,
  ChevronLeft,
  User,
  Heart,
  ImageIcon,
  Video,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface CustomizationFormProps {
  selectedTier: string | null;
  selectedTemplate: string | null;
}

const occasions = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "valentines", label: "Valentine's Day" },
  { value: "other", label: "Other" },
];

const genres = [
  { value: "pop", label: "Pop" },
  { value: "ballad", label: "Ballad" },
  { value: "acoustic", label: "Acoustic" },
  { value: "upbeat", label: "Upbeat" },
];

const steps = [
  { id: 1, title: "Occasion & Basic Info", icon: Calendar },
  { id: 2, title: "Song Writing Details", icon: Music },
  { id: 3, title: "Photos & Media", icon: Upload },
];

export const CustomizationForm = ({ selectedTier, selectedTemplate }: CustomizationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    occasion: "",
    recipientName: "",
    occasionDate: "",
    verse1Memory: "",
    verse2Memory: "",
    chorusMemory: "",
    songGenre: "",
    photos: [] as File[],
    videos: [] as File[],
  });

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const isPremium = selectedTier?.includes("Premium");
  const maxPhotos = isPremium ? 50 : 10;
  const maxVideos = isPremium ? 5 : 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (type: "photos" | "videos", files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const limit = type === "photos" ? maxPhotos : maxVideos;
    const current = formData[type].length;
    
    if (current + fileArray.length > limit) {
      toast({
        title: "Upload limit reached",
        description: `You can only upload up to ${limit} ${type}.`,
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], ...fileArray],
    }));
  };

  const removeFile = (type: "photos" | "videos", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.occasion && formData.recipientName && formData.occasionDate);
      case 2:
        return !!(
          formData.verse1Memory.length >= 50 &&
          formData.verse2Memory.length >= 50 &&
          formData.chorusMemory.length >= 50 &&
          formData.songGenre
        );
      case 3:
        return formData.photos.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Order Submitted! 🎉",
      description: "We'll start creating your personalized gift right away.",
    });
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast({
        title: "Please complete all fields",
        description: "Some required information is missing.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <section id="customize" className="py-24 bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Customize Your Gift
            </h2>
            <p className="text-muted-foreground text-lg">
              Share your memories and let us create something magical.
            </p>
          </div>

          {/* Selection Summary */}
          {(selectedTier || selectedTemplate) && (
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {selectedTier && (
                <div className="inline-flex items-center gap-2 bg-secondary/80 rounded-full px-4 py-2 text-sm">
                  <Check className="w-4 h-4 text-gold" />
                  <span className="text-foreground">{selectedTier}</span>
                </div>
              )}
              {selectedTemplate && (
                <div className="inline-flex items-center gap-2 bg-secondary/80 rounded-full px-4 py-2 text-sm">
                  <Check className="w-4 h-4 text-gold" />
                  <span className="text-foreground capitalize">
                    {selectedTemplate.replace(/-/g, " ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "bg-gold/20 text-gold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                  <span className="text-sm font-medium sm:hidden">{step.id}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      currentStep > step.id ? "bg-gold" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Occasion & Basic Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blush/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-blush-deep" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        Basic Information
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Tell us about the occasion and recipient
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="occasion">Occasion *</Label>
                      <Select
                        value={formData.occasion}
                        onValueChange={(value) => handleInputChange("occasion", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasions.map((occ) => (
                            <SelectItem key={occ.value} value={occ.value}>
                              {occ.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occasionDate">Occasion Date *</Label>
                      <Input
                        id="occasionDate"
                        type="date"
                        value={formData.occasionDate}
                        onChange={(e) => handleInputChange("occasionDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient's Name *</Label>
                    <Input
                      id="recipientName"
                      placeholder="Enter their name"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange("recipientName", e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Song Writing Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                      <Music className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        Song Writing Details
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Share memories to inspire your custom song
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="verse1">
                        First Verse Memory * <span className="text-muted-foreground">(Min 50 chars)</span>
                      </Label>
                      <Textarea
                        id="verse1"
                        placeholder="Describe a specific memory or situation for the first verse..."
                        value={formData.verse1Memory}
                        onChange={(e) => handleInputChange("verse1Memory", e.target.value)}
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.verse1Memory.length}/50 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verse2">
                        Second Verse Memory * <span className="text-muted-foreground">(Min 50 chars)</span>
                      </Label>
                      <Textarea
                        id="verse2"
                        placeholder="Describe another meaningful moment or story..."
                        value={formData.verse2Memory}
                        onChange={(e) => handleInputChange("verse2Memory", e.target.value)}
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.verse2Memory.length}/50 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chorus">
                        Chorus/Bridge Memory * <span className="text-muted-foreground">(Min 50 chars)</span>
                      </Label>
                      <Textarea
                        id="chorus"
                        placeholder="Share what makes your relationship special..."
                        value={formData.chorusMemory}
                        onChange={(e) => handleInputChange("chorusMemory", e.target.value)}
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.chorusMemory.length}/50 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genre">Preferred Song Genre *</Label>
                      <Select
                        value={formData.songGenre}
                        onValueChange={(value) => handleInputChange("songGenre", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((genre) => (
                            <SelectItem key={genre.value} value={genre.value}>
                              {genre.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Photos & Media */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        Photos & Media
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Upload your favorite memories
                      </p>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-3">
                    <Label>
                      Photos * <span className="text-muted-foreground">({formData.photos.length}/{maxPhotos})</span>
                    </Label>
                    <label
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Drag & drop or click to upload photos
                      </span>
                      <input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload("photos", e.target.files)}
                      />
                    </label>
                    {formData.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.photos.map((file, index) => (
                          <div
                            key={index}
                            className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted group"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeFile("photos", index)}
                              className="absolute inset-0 bg-foreground/60 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload (Premium only) */}
                  {isPremium && (
                    <div className="space-y-3">
                      <Label>
                        Videos <span className="text-muted-foreground">({formData.videos.length}/{maxVideos})</span>
                      </Label>
                      <label
                        htmlFor="video-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Video className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Drag & drop or click to upload videos
                        </span>
                        <input
                          id="video-upload"
                          type="file"
                          multiple
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("videos", e.target.files)}
                        />
                      </label>
                      {formData.videos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.videos.map((file, index) => (
                            <div
                              key={index}
                              className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-muted group"
                            >
                              <Video className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-[120px]">{file.name}</span>
                              <button
                                onClick={() => removeFile("videos", index)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button variant="hero" onClick={nextStep} className="gap-2">
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="gold" onClick={handleSubmit} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Submit Order
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
