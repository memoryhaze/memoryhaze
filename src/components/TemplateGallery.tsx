import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Eye, Check, Heart, Sparkles, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: typeof Heart;
  preview: string;
  gradient: string;
  accent: string;
}

const templates: Template[] = [
  {
    id: "minimalist-love",
    name: "Minimalist Love",
    description: "Clean, elegant design with subtle animations",
    icon: Heart,
    preview: "A refined experience with soft whites and gentle typography",
    gradient: "from-rose-50 to-pink-50",
    accent: "bg-rose-100",
  },
  {
    id: "grand-anniversary",
    name: "Grand Anniversary",
    description: "Luxurious gold accents for milestone celebrations",
    icon: Sparkles,
    preview: "Rich gold elements with elegant serif typography",
    gradient: "from-amber-50 to-yellow-50",
    accent: "bg-amber-100",
  },
  {
    id: "birthday-celebration",
    name: "Birthday Celebration",
    description: "Vibrant and joyful with playful elements",
    icon: Gift,
    preview: "Colorful confetti and festive animations",
    gradient: "from-purple-50 to-indigo-50",
    accent: "bg-purple-100",
  },
  {
    id: "romantic-evening",
    name: "Romantic Evening",
    description: "Deep, intimate colors for Valentine's Day",
    icon: Star,
    preview: "Dark romantic theme with starlight accents",
    gradient: "from-slate-800 to-slate-900",
    accent: "bg-slate-700",
  },
];

interface TemplateGalleryProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateGallery = ({ selectedTemplate, onSelectTemplate }: TemplateGalleryProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  return (
    <section id="templates" className="py-24 bg-muted/30 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Template
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select a beautiful design that matches the mood and occasion of your gift.
          </p>
        </motion.div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {templates.map((template, index) => {
            const isSelected = selectedTemplate === template.id;
            const isDark = template.id === "romantic-evening";

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative group cursor-pointer ${
                  isSelected ? "ring-2 ring-gold ring-offset-4 ring-offset-background" : ""
                }`}
                onClick={() => onSelectTemplate(template.id)}
              >
                <div
                  className={`rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 h-full ${
                    isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
                  }`}
                >
                  {/* Preview Area */}
                  <div className={`h-48 bg-gradient-to-br ${template.gradient} relative overflow-hidden`}>
                    {/* Decorative elements */}
                    <div className={`absolute top-4 right-4 w-12 h-12 rounded-full ${template.accent} flex items-center justify-center`}>
                      <template.icon className={`w-6 h-6 ${isDark ? "text-white" : "text-foreground/60"}`} />
                    </div>
                    
                    {/* Mock content lines */}
                    <div className="absolute bottom-8 left-6 right-6 space-y-2">
                      <div className={`h-3 rounded ${isDark ? "bg-white/20" : "bg-foreground/10"} w-3/4`} />
                      <div className={`h-2 rounded ${isDark ? "bg-white/10" : "bg-foreground/5"} w-1/2`} />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template.id);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 bg-card">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      {template.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {template.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-2xl shadow-elevated max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const template = templates.find((t) => t.id === previewTemplate);
                if (!template) return null;
                const isDark = template.id === "romantic-evening";

                return (
                  <>
                    <div className={`h-64 bg-gradient-to-br ${template.gradient} relative p-8`}>
                      <div className={`absolute top-6 right-6 w-16 h-16 rounded-full ${template.accent} flex items-center justify-center`}>
                        <template.icon className={`w-8 h-8 ${isDark ? "text-white" : "text-foreground/60"}`} />
                      </div>
                      <div className="absolute bottom-8 left-8 right-8 space-y-3">
                        <div className={`h-6 rounded ${isDark ? "bg-white/20" : "bg-foreground/10"} w-3/4`} />
                        <div className={`h-4 rounded ${isDark ? "bg-white/10" : "bg-foreground/5"} w-1/2`} />
                        <div className={`h-3 rounded ${isDark ? "bg-white/10" : "bg-foreground/5"} w-2/3`} />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                        {template.name}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {template.preview}
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="hero"
                          onClick={() => {
                            onSelectTemplate(template.id);
                            setPreviewTemplate(null);
                          }}
                        >
                          Select This Template
                        </Button>
                        <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
