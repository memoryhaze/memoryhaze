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
  Check,
  Sparkles,
  Loader2,
  MessageSquare,
  X,
  CreditCard,
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
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface CustomizationFormProps {
  selectedTier: string | null;
  selectedTemplate: string | null;
  onTierChange?: (tier: string) => void;
}

const occasions = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "valentines", label: "Valentine's Day" },
];

const genres = [
  { value: "pop", label: "Pop" },
  { value: "ballad", label: "Ballad" },
  { value: "acoustic", label: "Acoustic" },
  { value: "upbeat", label: "Upbeat" },
  { value: "rock", label: "Rock" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "hiphop", label: "Hip-Hop" },
  { value: "rnb", label: "R&B" },
  { value: "country", label: "Country" },
];

const plans = [
  {
    value: "momentum",
    label: "Momentum",
    description: "7-day access",
    price: "₹499"
  },
  {
    value: "everlasting",
    label: "Everlasting",
    description: "14-day access",
    price: "₹599"
  },
];

const steps = [
  { id: 1, title: "Occasion & Basic Info", icon: Calendar },
  { id: 2, title: "Song Writing Details", icon: Music },
  { id: 3, title: "Photos & Plan", icon: Upload },
  { id: 4, title: "Message & Submit", icon: MessageSquare },
];

export const CustomizationForm = ({ selectedTier, selectedTemplate, onTierChange }: CustomizationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ url: string; publicId: string }[]>([]);
  const [formData, setFormData] = useState({
    occasion: "",
    recipientName: "",
    occasionDate: "",
    verse1Memory: "",
    verse2Memory: "",
    chorusMemory: "",
    songGenre: "",
    photos: [] as File[],
    plan: selectedTier?.toLowerCase().includes("everlasting") ? "everlasting" :
      selectedTier?.toLowerCase().includes("momentum") ? "momentum" : "",
    message: "",
  });

  const { token, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Prevent selecting past dates for occasion
  const todayISO = new Date().toISOString().split("T")[0];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const maxPhotos = 4;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const current = formData.photos.length;

    if (current + fileArray.length > maxPhotos) {
      toast.error("Upload limit reached", {
        description: `You can only upload up to ${maxPhotos} photos.`,
      });
      return;
    }

    // Filter for images only
    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...imageFiles],
    }));
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.occasion && formData.recipientName && formData.occasionDate);
      case 2:
        return !!(
          formData.verse1Memory.length >= 150 &&
          formData.verse2Memory.length >= 150 &&
          formData.chorusMemory.length >= 150 &&
          formData.songGenre
        );
      case 3:
        return formData.photos.length > 0 && formData.plan !== "";
      case 4:
        return true; // Message is optional
      default:
        return false;
    }
  };

  const uploadPhotosToCloudinary = async (): Promise<{ urls: string[]; publicIds: string[] }> => {
    const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary not configured");
    }

    // Generate a unique folder for this gift
    // Fetch user's current gift count to determine the next gift number
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
    let giftCount = 0;
    let userIdForFolder = profile?.userId || 'guest';

    try {
      // Fetch user profile if userId is not available
      if (!profile?.userId) {
        const userResponse = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          userIdForFolder = userData.userId || 'guest';
        }
      }

      // Fetch current gift count
      const giftsResponse = await fetch(`${API_BASE}/api/gifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (giftsResponse.ok) {
        const giftsData = await giftsResponse.json();
        giftCount = giftsData.gifts?.length || 0;
      }
    } catch (error) {
      console.warn('Could not fetch user data or gift count:', error);
    }

    // Use userId (usr-00001 format) and sequential gift numbering
    const giftNumber = giftCount + 1;
    const folderPath = `MemoryHaze/${userIdForFolder}/gift${giftNumber}`;

    const uploadedUrls: string[] = [];
    const uploadedPublicIds: string[] = [];

    for (let i = 0; i < formData.photos.length; i++) {
      const file = formData.photos[i];
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', uploadPreset);
      fd.append('folder', folderPath);
      fd.append('public_id', `photo_${i + 1}`);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Photo upload failed');
      }

      const data = await res.json();
      uploadedUrls.push(data.secure_url);
      uploadedPublicIds.push(data.public_id);
    }

    return { urls: uploadedUrls, publicIds: uploadedPublicIds };
  };

  const handleSubmit = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !token) {
      toast.error("Please log in to submit your order", {
        description: "You need to be logged in to create a gift request.",
        action: {
          label: "Log In",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    // Validate all steps
    for (let i = 1; i <= 3; i++) {
      if (!validateStep(i)) {
        toast.error("Please complete all required fields", {
          description: `Step ${i} has missing information.`,
        });
        setCurrentStep(i);
        return;
      }
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Step 1: Upload photos to Cloudinary
      toast.info("Uploading photos...", { description: "Please wait while we upload your photos." });

      const { urls: photoUrls, publicIds: photoPublicIds } = await uploadPhotosToCloudinary();

      setIsUploading(false);
      toast.success("Photos uploaded successfully!");

      // Step 2: Submit gift request to backend
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';

      const payload = {
        recipientName: formData.recipientName.trim(),
        occasion: formData.occasion,
        occasionDate: formData.occasionDate,
        scenarios: [
          formData.verse1Memory.trim(),
          formData.verse2Memory.trim(),
          formData.chorusMemory.trim(),
        ],
        songGenre: formData.songGenre,
        photos: photoUrls,
        photoPublicIds: photoPublicIds,
        plan: formData.plan,
        message: formData.message.trim(),
      };

      const response = await fetch(`${API_BASE}/api/gifts/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to submit order');
      }

      const result = await response.json();

      toast.success("🎉 Order Submitted Successfully!", {
        description: "We'll review your order and notify you via email once your gift is ready.",
        duration: 8000,
      });

      // Reset form
      setFormData({
        occasion: "",
        recipientName: "",
        occasionDate: "",
        verse1Memory: "",
        verse2Memory: "",
        chorusMemory: "",
        songGenre: "",
        photos: [],
        plan: "",
        message: "",
      });
      setCurrentStep(1);

      // Navigate to gifts page after a short delay
      setTimeout(() => {
        navigate("/gifts");
      }, 2000);

    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Failed to submit order", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      let message = "Some required information is missing.";
      if (currentStep === 2) {
        message = "Each scenario must be at least 150 characters. Please provide more detail about your memories.";
      }
      toast.error("Please complete all fields", { description: message });
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
              Create Your Gift
            </h2>
            <p className="text-muted-foreground text-lg">
              Share your memories and let us craft something magical for your loved one.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-10 px-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                        ? "bg-gradient-to-br from-blush to-gold text-white shadow-lg scale-110"
                        : isComplete
                          ? "bg-gold/20 text-gold"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {isComplete ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center max-w-[80px] ${isActive ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-8 sm:w-16 mx-2 rounded-full transition-colors duration-300 ${currentStep > step.id ? "bg-gold" : "bg-border"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Container */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Occasion */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Occasion *</Label>
                      <Select
                        value={formData.occasion}
                        onValueChange={(value) => handleInputChange("occasion", value)}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-border/70 bg-muted/20 focus:ring-2 focus:ring-blush/40">
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

                    {/* Occasion Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Occasion Date *</Label>
                      <Input
                        type="date"
                        min={todayISO}
                        value={formData.occasionDate}
                        onChange={(e) => handleInputChange("occasionDate", e.target.value)}
                        className="h-12 rounded-xl border-border/70 bg-muted/20 focus:ring-2 focus:ring-blush/40"
                      />
                    </div>
                  </div>

                  {/* Recipient Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-blush-deep" />
                      Recipient's Name *
                    </Label>
                    <Input
                      placeholder="Who is this gift for?"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange("recipientName", e.target.value)}
                      className="h-12 rounded-xl border-border/70 bg-muted/20 focus:ring-2 focus:ring-blush/40"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Song Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    Share 3 special memories or scenarios. These will inspire the lyrics of your personalized song.
                    Each scenario should be at least 150 characters.
                  </p>

                  {/* Scenario 1 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blush-deep" />
                        Scenario 1 *
                      </span>
                      <span className={`text-xs ${formData.verse1Memory.length >= 150 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {formData.verse1Memory.length}/150 min
                      </span>
                    </Label>
                    <Textarea
                      placeholder="Describe a special memory together..."
                      value={formData.verse1Memory}
                      onChange={(e) => handleInputChange("verse1Memory", e.target.value)}
                      className="min-h-[100px] rounded-xl border-border/70 bg-muted/20 focus:ring-2 focus:ring-blush/40 resize-none"
                    />
                  </div>

                  {/* Scenario 2 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blush-deep" />
                        Scenario 2 *
                      </span>
                      <span className={`text-xs ${formData.verse2Memory.length >= 150 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {formData.verse2Memory.length}/150 min
                      </span>
                    </Label>
                    <Textarea
                      placeholder="Share another cherished moment..."
                      value={formData.verse2Memory}
                      onChange={(e) => handleInputChange("verse2Memory", e.target.value)}
                      className="min-h-[100px] rounded-xl border-border/70 bg-muted/20 focus:ring-2 focus:ring-blush/40 resize-none"
                    />
                  </div>

                  {/* Scenario 3 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blush-deep" />
                        Scenario 3 *
                      </span>
                      <span className={`text-xs ${formData.chorusMemory.length >= 150 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {formData.chorusMemory.length}/150 min
                      </span>
                    </Label>
                    <Textarea
                      placeholder="One more meaningful experience..."
                      value={formData.chorusMemory}
                      onChange={(e) => handleInputChange("chorusMemory", e.target.value)}
                      className="min-h-[100px] rounded-xl border-border/70 bg-muted/20 focus:ring-2 focus:ring-blush/40 resize-none"
                    />
                  </div>

                  {/* Song Genre */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Music className="w-4 h-4 text-gold" />
                      Preferred Song Genre *
                    </Label>
                    <Select
                      value={formData.songGenre}
                      onValueChange={(value) => handleInputChange("songGenre", value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-border/70 bg-muted/20 focus:ring-2 focus:ring-blush/40">
                        <SelectValue placeholder="Select a genre" />
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
                </motion.div>
              )}

              {/* Step 3: Photos & Plan */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Photo Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blush-deep" />
                      Upload Photos *
                      <span className="text-muted-foreground font-normal">
                        ({formData.photos.length}/{maxPhotos})
                      </span>
                    </Label>

                    <label
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/70 rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 hover:border-blush/50 transition-all group"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-blush transition-colors" />
                      <span className="text-sm text-muted-foreground">
                        Click or drag to upload photos
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Max {maxPhotos} photos
                      </span>
                      <input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                      />
                    </label>

                    {/* Photo Preview Grid */}
                    {formData.photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-4">
                        {formData.photos.map((file, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-border/50"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-foreground/80 text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gold" />
                      Select Plan *
                    </Label>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {plans.map((plan) => (
                        <button
                          key={plan.value}
                          type="button"
                          onClick={() => {
                            handleInputChange("plan", plan.value);
                            onTierChange?.(plan.value === "everlasting" ? "Everlasting" : "Momentum");
                          }}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${formData.plan === plan.value
                            ? "border-gold bg-gold/10 shadow-md"
                            : "border-border/70 hover:border-blush/50 hover:bg-muted/30"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">{plan.label}</span>
                            <span className="text-gold font-bold">{plan.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Message & Submit */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Personal Message */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blush-deep" />
                      Personal Message (Optional)
                    </Label>
                    <Textarea
                      placeholder="Add a personal message that will appear with the gift..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      className="min-h-[120px] rounded-xl border-border/70 bg-muted/20 focus:ring-2 focus:ring-blush/40 resize-none"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-foreground">Order Summary</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">Recipient:</span>
                      <span className="text-foreground">{formData.recipientName}</span>

                      <span className="text-muted-foreground">Occasion:</span>
                      <span className="text-foreground capitalize">{formData.occasion}</span>

                      <span className="text-muted-foreground">Date:</span>
                      <span className="text-foreground">
                        {formData.occasionDate ? new Date(formData.occasionDate).toLocaleDateString() : '-'}
                      </span>

                      <span className="text-muted-foreground">Genre:</span>
                      <span className="text-foreground capitalize">{formData.songGenre}</span>

                      <span className="text-muted-foreground">Photos:</span>
                      <span className="text-foreground">{formData.photos.length} photo(s)</span>

                      <span className="text-muted-foreground">Plan:</span>
                      <span className="text-foreground capitalize">
                        {plans.find(p => p.value === formData.plan)?.label} - {plans.find(p => p.value === formData.plan)?.price}
                      </span>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-center">
                      <p className="text-sm text-foreground mb-2">
                        Please log in to submit your order
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/login")}
                      >
                        Log In
                      </Button>
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
                disabled={currentStep === 1 || isSubmitting}
                className="gap-2 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button variant="hero" onClick={nextStep} className="gap-2 rounded-xl">
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="gold"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isAuthenticated}
                  className="gap-2 rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isUploading ? "Uploading Photos..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Submit Order
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
