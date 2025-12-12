import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TemplateGallery } from "@/components/TemplateGallery";

const Memories = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-28 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Memories</h1>
        <p className="text-muted-foreground mb-8">Preview a template or open it in fullscreen.</p>
        <TemplateGallery
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      </section>
    </main>
  );
};

export default Memories;
