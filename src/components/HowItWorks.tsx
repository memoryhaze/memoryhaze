import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Palette, PenLine, Share2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Palette,
    title: "Choose",
    description: "Select your preferred tier and pick a beautiful template that matches the occasion.",
    color: "from-blush to-blush-deep",
    bgColor: "bg-blush/20",
  },
  {
    icon: PenLine,
    title: "Share",
    description: "Fill in your memories, upload photos, and let us craft a custom song from your story.",
    color: "from-gold to-accent",
    bgColor: "bg-gold/20",
  },
  {
    icon: Share2,
    title: "Surprise",
    description: "Share the private link to reveal a stunning webpage with their personalized song.",
    color: "from-navy to-navy-light",
    bgColor: "bg-navy/10",
  },
];

export const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create the perfect gift in three simple steps. We handle the creativity, 
            you provide the love.
          </p>
        </motion.div>

        <div ref={ref} className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blush via-gold to-navy/50 -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 h-full">
                  {/* Step number */}
                  <div className="absolute -top-3 left-8 bg-gradient-to-r from-primary to-navy-light text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">
                    Step {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl ${step.bgColor} flex items-center justify-center mb-6 mt-2`}>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector for mobile/tablet */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4 md:hidden">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/50 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
