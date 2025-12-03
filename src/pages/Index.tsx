import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TierPricing } from "@/components/TierPricing";
import { TemplateGallery } from "@/components/TemplateGallery";
import { CustomizationForm } from "@/components/CustomizationForm";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelectTier = (tier: string) => {
    setSelectedTier(tier);
    // Scroll to templates after selecting tier
    setTimeout(() => {
      const element = document.querySelector("#templates");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Scroll to form after selecting template
    setTimeout(() => {
      const element = document.querySelector("#customize");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <TierPricing onSelectTier={handleSelectTier} />
      <TemplateGallery
        selectedTemplate={selectedTemplate}
        onSelectTemplate={handleSelectTemplate}
      />
      <CustomizationForm
        selectedTier={selectedTier}
        selectedTemplate={selectedTemplate}
      />
      <Footer />
    </main>
  );
};

export default Index;
