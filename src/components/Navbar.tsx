import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Music, Heart, User, LogOut, ChevronDown, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAuthenticated, logout } from "@/lib/authUtils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Templates", href: "#templates" },
];

type NavbarProps = {
  hideMarketingLinks?: boolean;
  logoAsLinkTo?: string;
};

export const Navbar = ({ hideMarketingLinks = false, logoAsLinkTo = "#" }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated: ctxAuthenticated, isAdmin: ctxIsAdmin, token: ctxToken } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Reflect AuthContext auth state
    setIsAuth(ctxAuthenticated);
    // Fetch user email best-effort when authenticated
    const fetchEmail = async () => {
      if (!ctxAuthenticated) {
        setUserEmail("");
        return;
      }
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${ctxToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email);
        } else {
          setUserEmail("");
        }
      } catch (e) {
        setUserEmail("");
      }
    };
    fetchEmail();
  }, [ctxAuthenticated, ctxToken]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfileMenu && !target.closest('.profile-dropdown-container')) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setShowProfileMenu(false);
    toast.success("Logged out successfully");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/95 backdrop-blur-md shadow-soft"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to={logoAsLinkTo}
            className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <Heart className="w-7 h-7 text-blush-deep fill-blush" />
              <Music className="w-4 h-4 text-gold absolute -bottom-1 -right-1" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              MemoryHaze
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!hideMarketingLinks && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  {link.name}
                </button>
              ))}
            </div>
          )}

          {/* CTA Buttons / Profile */}
          <div className="hidden md:flex items-center gap-4">
            {isAuth ? (
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium max-w-[150px] truncate">
                    {userEmail}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg overflow-hidden"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="text-xs text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-medium truncate">{userEmail}</p>
                      </div>
                      {ctxIsAdmin && (
                        <Link
                          to="/admin"
                          className="w-full block px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        to="/gifts"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Gift className="w-4 h-4" />
                        My Gifts
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="default">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {!hideMarketingLinks && navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </button>
              ))}
              {isAuth ? (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground px-2">Signed in as</p>
                  <p className="text-sm font-medium px-2 truncate">{userEmail}</p>
                  {ctxIsAdmin && (
                    <Link to="/admin" className="block">
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link to="/gifts" className="block" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      My Gifts
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button variant="hero" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

