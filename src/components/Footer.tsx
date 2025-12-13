import { useState } from "react";
import { Heart, Music, Mail, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // fallback to updating hash
      window.location.hash = id;
    }
  };
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Heart className="w-7 h-7 text-blush fill-blush" />
                <Music className="w-4 h-4 text-gold absolute -bottom-1 -right-1" />
              </div>
              <span className="font-display text-xl font-semibold">MemoryHaze</span>
            </div>
            <p className="text-primary-foreground/70 max-w-sm mb-6">
              Creating unforgettable personalized gifts that celebrate love, 
              milestones, and the moments that matter most.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/memory.haze"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:team.memoryhaze@gmail.com"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li>
                <button onClick={() => scrollToSection('#how-it-works')} className="hover:text-primary-foreground transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('#pricing')} className="hover:text-primary-foreground transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('#templates')} className="hover:text-primary-foreground transition-colors">
                  Templates
                </button>
              </li>
              <li>
                <button onClick={() => setIsFAQOpen(true)} className="hover:text-primary-foreground transition-colors">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li>
                <div className="flex items-center justify-between">
                  <span>Contact Us</span>
                </div>
                {/* <div className="mt-3 flex gap-4">
                  <a
                    href="https://instagram.com/memory.haze"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:team.memoryhaze@gmail.com"
                    className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div> */}
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">Refund Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/50 text-sm">
          <p>© {new Date().getFullYear()} MemoryHaze. Made with ❤️ for your special moments.</p>
        </div>
      </div>

      {/* FAQ Modal */}
      {isFAQOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsFAQOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-card text-foreground rounded-2xl shadow-xl border border-border p-6 sm:p-8">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">Frequently Asked Questions</h3>
              <button onClick={() => setIsFAQOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-5 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">How long does it take to deliver my gift?</p>
                <p>Most orders are delivered within 48 hours. Highly customized requests may take up to 3–5 days. We’ll keep you updated throughout.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Can I request revisions?</p>
                <p>Revisions depend on the plan you select. Momentum does not offer any revisions; Everlasting allows up to 2 revisions.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">What do you need from me to get started?</p>
                <p>Share the occasion, recipient’s name, key memories, preferred style, and any photos/videos you want included. This helps us personalize your gift.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Can you handle urgent/last-minute orders?</p>
                <p>Yes. We offer an express option subject to availability. Contact us for 24-hour delivery possibilities.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">How do I contact support?</p>
                <p>Reach us anytime at team.memoryhaze@gmail.com or DM us on Instagram @memory.haze.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsFAQOpen(false)} className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90">Close</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
