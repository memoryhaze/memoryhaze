import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Sparkles, Crown, Music, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tier {
  name: string;
  subtitle: string;
  price: string;
  priceNote: string;
  icon: typeof Crown;
  popular: boolean;
  features: { text: string; icon: typeof Check }[];
  buttonVariant: "hero" | "outline";
  gradient: string;
}

const tiers: Tier[] = [
  {
    name: "Momentum",
    subtitle: "Perfect for heartfelt moments",
    price: "₹499",
    priceNote: "One-time payment",
    icon: Music,
    popular: false,
    features: [
      { text: "Custom Web Page", icon: FileText },
      { text: "Page expires in 7 days", icon: Check },
      { text: "Up to 4 photo uploads", icon: Image },
      { text: "Private shareable link", icon: Check },
      { text: "No revisions", icon: Check },
    ],
    buttonVariant: "outline",
    gradient: "from-blush/50 to-secondary",
  },
  {
    name: "Everlasting",
    subtitle: "The ultimate celebration experience",
    price: "₹599",
    priceNote: "One-time payment",
    icon: Crown,
    popular: true,
    features: [
      { text: "Custom Web Page", icon: FileText },
      { text: "Page expires in 14 days", icon: Check },
      { text: "Up to 50 photos & 5 videos", icon: Video },
      { text: "Private shareable link", icon: Check },
      { text: "Up to 2 revisions", icon: Check },
      { text: "Priority delivery (48h)", icon: Check },
      { text: "Downloadable MP3", icon: Music },
    ],
    buttonVariant: "hero",
    gradient: "from-gold/30 to-accent/20",
  },
];

interface TierPricingProps {
  onSelectTier: (tier: string) => void;
}

export const TierPricing = ({ onSelectTier }: TierPricingProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-24 bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Experience
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the perfect tier to create an unforgettable gift that speaks
            from the heart.
          </p>
        </motion.div>

        <div ref={ref} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative rounded-2xl overflow-hidden ${tier.popular ? "ring-2 ring-gold shadow-glow" : "shadow-card"
                }`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gold to-accent text-foreground text-sm font-semibold text-center py-2">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Most Popular
                </div>
              )}

              <div
                className={`bg-gradient-to-br ${tier.gradient} p-8 ${tier.popular ? "pt-14" : ""
                  } h-full flex flex-col`}
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${tier.popular ? "bg-gold/20" : "bg-blush/30"
                    }`}>
                    <tier.icon className={`w-7 h-7 ${tier.popular ? "text-gold" : "text-blush-deep"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {tier.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">{tier.subtitle}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold text-foreground">
                      {tier.price}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{tier.priceNote}</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${tier.popular ? "bg-gold/20 text-gold" : "bg-blush/30 text-blush-deep"
                        }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={tier.buttonVariant}
                  size="lg"
                  className="w-full"
                  onClick={() => onSelectTier(tier.name)}
                >
                  Select {tier.name.split(" ")[0]}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-muted-foreground text-sm mt-12"
        >
          🚚 Delivery in 24–48 hours • 🔒 Secure checkout • 🔗 Private shareable link
        </motion.p>
      </div>
    </section>
  );
};
