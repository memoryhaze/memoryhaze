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
  assignedAt?: string;
  expiresAt?: string | null;
  accessEnabled?: boolean;
  permanentlyDeleted?: boolean;
  photos: string[];
  audio: string | null;
  lyrics: string;
  message?: string;
  createdAt: string;
};

const GiftViewer = () => {
  const { giftId, encryptedUserId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [gift, setGift] = useState<Gift | null>(null);
  const [isLoadingGift, setIsLoadingGift] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    // Wait for auth state to be loaded before checking authentication
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      // Store the intended URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate("/login");
      return;
    }
    if (!giftId) {
      setError("Invalid gift link.");
      return;
    }

    const load = async () => {
      setIsLoadingGift(true);
      setError(null);
      setAccessDenied(false);
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";

        // If encryptedUserId is present, use the secure endpoint (from email link)
        // Otherwise, use the simple endpoint (from My Gifts page - user already authenticated)
        const endpoint = encryptedUserId
          ? `${API_BASE}/api/gifts/${giftId}/${encodeURIComponent(encryptedUserId)}`
          : `${API_BASE}/api/gifts/${giftId}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 403 && data.intendedForDifferentUser) {
            setAccessDenied(true);
          }
          setError(data?.message || data?.error || "Failed to load gift");
          return;
        }
        setGift(data.gift);
      } catch {
        setError("Failed to connect to server. Please try again.");
      } finally {
        setIsLoadingGift(false);
      }
    };

    load();
  }, [giftId, encryptedUserId, isAuthenticated, isAuthLoading, navigate, token]);

  const handleClose = () => navigate(-1);

  if (isLoadingGift) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar hideMarketingLinks={true} logoAsLinkTo="/" />
        <div className="pt-28 container mx-auto px-4 text-muted-foreground">Loading…</div>
      </main>
    );
  }

  if (error || !gift) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar hideMarketingLinks={true} logoAsLinkTo="/" />
        <div className="pt-28 container mx-auto px-4 max-w-2xl">
          <div className={`rounded-2xl border p-8 ${accessDenied ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' : 'bg-muted/30 border-border'}`}>
            {accessDenied ? (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-center mb-4 text-red-900">
                  Access Restricted
                </h1>
                <p className="text-center text-red-800 mb-6">
                  {error}
                </p>
                <div className="bg-white/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Why am I seeing this?</strong><br />
                    This gift was created for a specific person and can only be viewed by logging in with the email address it was sent to.
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => navigate("/gifts")}
                    className="px-6 py-2.5 bg-gradient-to-r from-blush-deep to-gold text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    View My Gifts
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-destructive text-center mb-4 font-semibold">
                  {error || "Gift not found"}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate("/gifts")}
                    className="px-6 py-2.5 bg-gradient-to-r from-blush-deep to-gold text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Back to My Gifts
                  </button>
                </div>
              </>
            )}
          </div>
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
      <Navbar hideMarketingLinks={true} logoAsLinkTo="/" />
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
