import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

type GiftListItem = {
  _id: string;
  templateId: string;
  createdAt: string;
  memory?: string | null;
  plan?: string | null;
};

const templateLabel = (id: string) => {
  switch (id) {
    case "minimalist-love":
      return "Minimalist Love";
    case "grand-anniversary":
      return "Grand Anniversary";
    case "birthday-celebration":
      return "Birthday Celebration";
    case "romantic-evening":
      return "Romantic Evening";
    default:
      return id;
  }
};

const Gifts = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [gifts, setGifts] = useState<GiftListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/gifts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "Failed to load gifts");
          return;
        }
        setGifts(Array.isArray(data?.gifts) ? data.gifts : []);
      } catch {
        setError("Failed to load gifts");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isAuthenticated, navigate, token]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">My Gifts</h1>
            <p className="text-muted-foreground mt-1">Your personalized gifts created by the admin.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : gifts.length === 0 ? (
          <div className="text-muted-foreground">No gifts yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gifts.map((g) => (
              <div key={g._id} className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">{templateLabel(g.templateId)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(g.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {g.memory ? `Memory: ${g.memory}` : null}
                      {g.plan ? `${g.memory ? " • " : ""}Plan: ${g.plan}` : null}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate(`/gifts/${g._id}`)}>
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Gifts;
