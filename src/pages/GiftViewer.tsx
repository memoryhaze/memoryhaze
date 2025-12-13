import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  MinimalistLovePreview,
  GrandAnniversaryPreview,
  BirthdayCelebrationPreview,
  RomanticEveningPreview,
} from "@/components/templates";

type Gift = {
  _id: string;
  templateId: string;
  scenarios: string[];
  memory: string | null;
  plan: string | null;
  photos: string[];
  audio: string | null;
  lyrics: string;
  createdAt: string;
};

const GiftViewer = () => {
  const { giftId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [gift, setGift] = useState<Gift | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!giftId) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/gifts/${giftId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "Failed to load gift");
          return;
        }
        setGift(data.gift);
      } catch {
        setError("Failed to load gift");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [giftId, isAuthenticated, navigate, token]);

  const handleClose = () => navigate(-1);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 container mx-auto px-4 text-muted-foreground">Loading…</div>
      </main>
    );
  }

  if (error || !gift) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 container mx-auto px-4">
          <div className="text-destructive">{error || "Gift not found"}</div>
        </div>
      </main>
    );
  }

  const giftData = {
    photos: gift.photos,
    lyrics: gift.lyrics,
    audioUrl: gift.audio,
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      {gift.templateId === "minimalist-love" && (
        <MinimalistLovePreview variant="page" onClose={handleClose} onSelect={handleClose} giftData={giftData} />
      )}
      {gift.templateId === "grand-anniversary" && (
        <GrandAnniversaryPreview variant="page" onClose={handleClose} onSelect={handleClose} giftData={giftData} />
      )}
      {gift.templateId === "birthday-celebration" && (
        <BirthdayCelebrationPreview variant="page" onClose={handleClose} onSelect={handleClose} giftData={giftData} />
      )}
      {gift.templateId === "romantic-evening" && (
        <RomanticEveningPreview variant="page" onClose={handleClose} onSelect={handleClose} giftData={giftData} />
      )}
    </main>
  );
};

export default GiftViewer;
