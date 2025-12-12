import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import {
  MinimalistLovePreview,
  GrandAnniversaryPreview,
  BirthdayCelebrationPreview,
  RomanticEveningPreview,
} from "@/components/templates";

const MemoriesViewer = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const handleClose = () => navigate(-1);
  const handleSelect = () => navigate("/signup");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      {/* Render the chosen template in a fullscreen experience */}
      {templateId === "minimalist-love" && (
        <MinimalistLovePreview variant="page" onClose={handleClose} onSelect={handleSelect} />
      )}
      {templateId === "grand-anniversary" && (
        <GrandAnniversaryPreview variant="page" onClose={handleClose} onSelect={handleSelect} />
      )}
      {templateId === "birthday-celebration" && (
        <BirthdayCelebrationPreview variant="page" onClose={handleClose} onSelect={handleSelect} />
      )}
      {templateId === "romantic-evening" && (
        <RomanticEveningPreview variant="page" onClose={handleClose} onSelect={handleSelect} />
      )}
    </main>
  );
};

export default MemoriesViewer;
