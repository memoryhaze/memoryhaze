import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Search, Loader2, ChevronLeft, ChevronRight, Eye, EyeOff, PlusCircle, Trash2, RefreshCw, Music, Image, FileText, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
    _id: string;
    userId: string;
    email: string;
    createdAt: string;
}

interface Gift {
    _id: string;
    templateId: string;
    createdAt: string;
    assignedAt?: string;
    expiresAt?: string | null;
    accessEnabled?: boolean;
    permanentlyDeleted?: boolean;
    deletedAt?: string | null;
    memory?: string | null;
    plan?: string | null;
    message?: string;
}

const AdminDashboard = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [creating, setCreating] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [userPhotos, setUserPhotos] = useState<Record<string, File[]>>({});
    const [userAudio, setUserAudio] = useState<Record<string, File | null>>({});
    const [userScenarios, setUserScenarios] = useState<Record<string, [string, string, string]>>({});
    const [userMemoryType, setUserMemoryType] = useState<Record<string, string>>({});
    const [userPlan, setUserPlan] = useState<Record<string, string>>({});
    const [userTemplateId, setUserTemplateId] = useState<Record<string, string>>({});
    const [userLyrics, setUserLyrics] = useState<Record<string, string>>({});
    const [userMessage, setUserMessage] = useState<Record<string, string>>({});
    const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
    const [uploadError, setUploadError] = useState<Record<string, string | null>>({});
    const [imageUrlsByUser, setImageUrlsByUser] = useState<Record<string, string[]>>({});
    const [audioUrlByUser, setAudioUrlByUser] = useState<Record<string, string | null>>({});

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedUserGifts, setSelectedUserGifts] = useState<Gift[]>([]);
    const [giftsLoading, setGiftsLoading] = useState(false);
    const [giftsRefreshing, setGiftsRefreshing] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmDescription, setConfirmDescription] = useState('');
    const [confirmActionLabel, setConfirmActionLabel] = useState('Confirm');
    const [confirmIsDestructive, setConfirmIsDestructive] = useState(false);
    const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void> | void)>(null);

    const formatOccasion = (occasion: string | null) => {
        if (!occasion) return null;
        switch (occasion.toLowerCase()) {
            case "birthday":
                return "Birthday";
            case "anniversary":
                return "Anniversary";
            case "valentines":
                return "Valentine's Day";
            default:
                return occasion;
        }
    };

    const openConfirm = (opts: {
        title: string;
        description: string;
        actionLabel: string;
        destructive?: boolean;
        onConfirm: () => Promise<void> | void;
    }) => {
        setConfirmTitle(opts.title);
        setConfirmDescription(opts.description);
        setConfirmActionLabel(opts.actionLabel);
        setConfirmIsDestructive(!!opts.destructive);
        setConfirmAction(() => opts.onConfirm);
        setConfirmOpen(true);
    };

    const handlePhotosChange = (userId: string, files: FileList | null) => {
        if (!files) return;
        const existing = userPhotos[userId] || [];
        const incoming = Array.from(files);
        const combined = [...existing, ...incoming];
        if (combined.length > 4) {
            toast.error('Photo limit reached', { description: 'You can upload up to 4 photos.' });
        }
        setUserPhotos((prev) => ({
            ...prev,
            [userId]: combined.slice(0, 4),
        }));
    };

    const fetchUserGifts = async (user: User, isRefresh = false) => {
        if (isRefresh) setGiftsRefreshing(true);
        else setGiftsLoading(true);
        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
            const res = await fetch(`${API_BASE}/api/admin/users/${user._id}/gifts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error('Failed to load gifts', { description: data?.error || 'Server error' });
                return;
            }
            setSelectedUser(user);
            setSelectedUserGifts(Array.isArray(data?.gifts) ? data.gifts : []);
        } catch {
            toast.error('Failed to load gifts', { description: 'Failed to connect to server' });
        } finally {
            if (isRefresh) setGiftsRefreshing(false);
            else setGiftsLoading(false);
        }
    };

    const formatRemaining = (g: Gift) => {
        if (g.permanentlyDeleted) return 'Deleted';
        if (!g.expiresAt) return 'No expiry';
        const exp = new Date(g.expiresAt);
        const now = new Date();
        const diff = exp.getTime() - now.getTime();
        if (diff <= 0) return 'Expired';
        const totalMinutes = Math.floor(diff / 60000);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;
        const parts = [] as string[];
        if (days) parts.push(`${days}d`);
        if (hours || days) parts.push(`${hours}h`);
        parts.push(`${minutes}m`);
        return parts.join(' ');
    };

    const updateGiftAccess = async (giftId: string, nextEnabled: boolean) => {
        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
            const res = await fetch(`${API_BASE}/api/admin/gifts/${giftId}/access`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ accessEnabled: nextEnabled, resetExpiry: nextEnabled }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error('Failed to update access', {
                    description: data?.error || data?.message || 'Server error',
                });
                return;
            }
            setSelectedUserGifts((prev) => prev.map((g) => (g._id === giftId ? data.gift : g)));
        } catch {
            toast.error('Failed to update access', { description: 'Failed to connect to server' });
        }
    };

    const permanentlyDeleteGift = async (giftId: string) => {
        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
            const res = await fetch(`${API_BASE}/api/admin/gifts/${giftId}/permanent`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error('Failed to permanently delete gift', {
                    description: data?.error || data?.message || 'Server error',
                });
                return;
            }
            toast.success('Gift permanently deleted');
            if (selectedUser) {
                await fetchUserGifts(selectedUser, true);
            }
        } catch {
            toast.error('Failed to permanently delete gift', { description: 'Failed to connect to server' });
        }
    };

    const removePhotoAt = (userId: string, index: number) => {
        setUserPhotos((prev) => {
            const arr = [...(prev[userId] || [])];
            arr.splice(index, 1);
            return { ...prev, [userId]: arr };
        });
    };

    const fetchUsers = async (searchQuery: string, pageNum: number) => {
        setIsLoading(true);
        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(
                `${API_BASE}/api/admin/users?search=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                toast.error("Error", {
                    description: data.error || "Failed to fetch users",
                });
                return;
            }

            const data = await response.json();
            setUsers(data.users);
            setTotal(data.total);
        } catch (error) {
            toast.error("Error", {
                description: "Failed to connect to server",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSuggestions = async (query: string) => {
        if (!query) {
            setSuggestions([]);
            setSuggestOpen(false);
            return;
        }
        setSuggestLoading(true);
        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
            const res = await fetch(`${API_BASE}/api/admin/users?search=${encodeURIComponent(query)}&page=1&limit=5`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data.users)) {
                setSuggestions(data.users);
                setSuggestOpen(true);
            } else {
                setSuggestions([]);
                setSuggestOpen(false);
            }
        } catch {
            setSuggestions([]);
            setSuggestOpen(false);
        } finally {
            setSuggestLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newPassword) {
            toast.error("Missing fields", { description: "Email and password are required" });
            return;
        }
        setCreating(true);
        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
            const res = await fetch(`${API_BASE}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: newEmail, password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error('Failed to create user', { description: data.error || 'Server error' });
                return;
            }
            toast.success('User created', { description: `${data.user.email} can now log in` });
            setNewEmail('');
            setNewPassword('');
            // Refresh list to include new user
            fetchUsers(search, 1);
            setPage(1);
        } catch (err: any) {
            toast.error('Error', { description: err?.message || 'Failed to create user' });
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        fetchUsers(search, page);
    }, [search, page]);

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 relative overflow-hidden">
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={confirmIsDestructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
                            onClick={async () => {
                                setConfirmOpen(false);
                                const fn = confirmAction;
                                if (!fn) return;
                                await fn();
                            }}
                        >
                            {confirmActionLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Navbar hideMarketingLinks logoAsLinkTo="/" />
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blush/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-28">
                {/* Top bar: title left; search + create user right (sticky below navbar) */}
                <div className="sticky top-16 lg:top-20 z-40 bg-background/80 backdrop-blur-md border-b border-white/20 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h1 className="font-display text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-[380px]">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="Search by email..."
                                value={searchInput}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchInput(val);
                                    fetchSuggestions(val);
                                }}
                                onKeyPress={handleKeyPress}
                                className="pl-9 bg-white/50"
                                onFocus={() => { if (searchInput) setSuggestOpen(true); }}
                                onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                                name="admin-search-email"
                                autoComplete="email"
                            />
                            {suggestOpen && (
                                <div className="absolute z-[1000] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-xl">
                                    {suggestLoading ? (
                                        <div className="px-3 py-2 text-sm text-gray-600">Searching…</div>
                                    ) : suggestions.length ? (
                                        <ul className="max-h-60 overflow-auto">
                                            {suggestions.map((u) => (
                                                <li key={u._id}>
                                                    <button
                                                        type="button"
                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => {
                                                            setSuggestOpen(false);
                                                            setSearchInput(u.email);
                                                            setSearch(u.email);
                                                            setPage(1);
                                                            fetchUsers(u.email, 1);
                                                        }}
                                                    >{u.email}</button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-600">No matches</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                        {/* Create User modal */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90">Create User</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New User</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            name="new-user-email"
                                            autoComplete="email"
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="text-sm font-medium">Password</label>
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder=""
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="mt-1 pr-9"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword((s) => !s)}
                                            className="absolute right-3 bottom-2.5 text-muted-foreground"
                                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create'}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-soft">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Users ({total})</h2>
                            <div className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No users found
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-muted/30 rounded-lg font-medium text-sm">
                                    <div>Email</div>
                                    <div className="text-right">Joined</div>
                                    <div className="text-right">Actions</div>
                                </div>

                                {/* Table Rows */}
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors"
                                    >
                                        <button
                                            type="button"
                                            className="flex items-center text-left"
                                            onClick={() => fetchUserGifts(user)}
                                            title="View gifts for user"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                                <span className="text-sm font-medium text-primary">
                                                    {user.email[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="truncate">{user.email}</span>
                                        </button>
                                        <div className="text-right flex items-center justify-end text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border hover:bg-muted/50 transition-colors"
                                                        title="Create for user"
                                                        aria-label="Create for user"
                                                    >
                                                        <PlusCircle className="w-5 h-5 text-primary" />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[95vw] sm:w-[600px] md:w-[700px] max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-card shadow-xl p-0">
                                                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30 bg-muted/20">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blush/30 to-gold/20 flex items-center justify-center">
                                                                <PlusCircle className="w-5 h-5 text-blush-deep" />
                                                            </div>
                                                            <div>
                                                                <DialogTitle className="font-display text-xl font-semibold text-foreground">Create Gift</DialogTitle>
                                                                <p className="text-sm text-muted-foreground mt-0.5">for {user.email}</p>
                                                            </div>
                                                        </div>
                                                    </DialogHeader>
                                                    <div className="space-y-6 text-foreground px-6 py-6">
                                                        {/* Photos Upload */}
                                                        <div className="space-y-3">
                                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                                <Image className="w-4 h-4 text-blush-deep" />
                                                                Upload Photos
                                                            </Label>
                                                            <label
                                                                htmlFor={`photo-upload-${user._id}`}
                                                                className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 hover:bg-muted/40 hover:border-blush/50 transition-all cursor-pointer group"
                                                            >
                                                                <Upload className="w-7 h-7 text-muted-foreground group-hover:text-blush-deep transition-colors mb-2" />
                                                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to select up to 4 images</span>
                                                            </label>
                                                            <input
                                                                id={`photo-upload-${user._id}`}
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                className="hidden"
                                                                onChange={(e) => handlePhotosChange(user._id, e.target.files)}
                                                            />
                                                            {(userPhotos[user._id] || []).length > 0 && (
                                                                <div className="grid grid-cols-4 gap-3 mt-2">
                                                                    {(userPhotos[user._id] || []).map((file, idx) => (
                                                                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-border/50 bg-muted">
                                                                            <img
                                                                                src={URL.createObjectURL(file)}
                                                                                alt={`Photo ${idx + 1}`}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removePhotoAt(user._id, idx)}
                                                                                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-foreground/80 text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                                                                aria-label="Remove photo"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Audio Upload */}
                                                        <div className="space-y-3">
                                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                                <Music className="w-4 h-4 text-blush-deep" />
                                                                Upload Audio
                                                            </Label>
                                                            <label
                                                                htmlFor={`audio-upload-${user._id}`}
                                                                className={`flex items-center justify-center w-full h-20 rounded-xl border-2 border-dashed transition-all cursor-pointer group ${userAudio[user._id]
                                                                    ? 'border-gold/50 bg-gold/5 hover:bg-gold/10'
                                                                    : 'border-border/70 bg-muted/20 hover:bg-muted/40 hover:border-blush/50'
                                                                    }`}
                                                            >
                                                                {userAudio[user._id] ? (
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                                                            <Music className="w-5 h-5 text-gold" />
                                                                        </div>
                                                                        <div className="text-left">
                                                                            <p className="text-sm font-medium text-foreground truncate max-w-[280px]">{userAudio[user._id]?.name}</p>
                                                                            <p className="text-xs text-muted-foreground">Click to change audio file</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center">
                                                                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-blush-deep transition-colors mb-1" />
                                                                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to select an audio file</span>
                                                                    </div>
                                                                )}
                                                            </label>
                                                            <input
                                                                id={`audio-upload-${user._id}`}
                                                                type="file"
                                                                accept="audio/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const f = e.target.files?.[0] || null;
                                                                    setUserAudio((prev) => ({ ...prev, [user._id]: f }));
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Occasion & Plan */}
                                                        <div className="grid sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold">Occasion *</Label>
                                                                <Select
                                                                    value={userMemoryType[user._id] || ''}
                                                                    onValueChange={(value) => setUserMemoryType((prev) => ({ ...prev, [user._id]: value }))}
                                                                >
                                                                    <SelectTrigger className="w-full h-11 rounded-xl border border-border/70 bg-muted/20 px-4 text-sm focus:ring-2 focus:ring-blush/40 transition-all hover:bg-muted/40">
                                                                        <SelectValue placeholder="Select occasion" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="birthday">Birthday</SelectItem>
                                                                        <SelectItem value="anniversary">Anniversary</SelectItem>
                                                                        <SelectItem value="valentines">Valentine's Day</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold">Plan *</Label>
                                                                <Select
                                                                    value={userPlan[user._id] || ''}
                                                                    onValueChange={(value) => setUserPlan((prev) => ({ ...prev, [user._id]: value }))}
                                                                >
                                                                    <SelectTrigger className="w-full h-11 rounded-xl border border-border/70 bg-muted/20 px-4 text-sm focus:ring-2 focus:ring-blush/40 transition-all hover:bg-muted/40">
                                                                        <SelectValue placeholder="Select plan" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="momentum">Momentum</SelectItem>
                                                                        <SelectItem value="everlasting">Everlasting</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {/* Scenarios */}
                                                        <div className="space-y-3">
                                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-blush-deep" />
                                                                Scenarios
                                                            </Label>
                                                            <div className="space-y-3">
                                                                {([0, 1, 2] as const).map((idx) => (
                                                                    <textarea
                                                                        key={idx}
                                                                        className="w-full min-h-[120px] rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 focus:border-blush/50 transition-all resize-none placeholder:text-muted-foreground/60 hover:bg-muted/30"
                                                                        placeholder={`Describe scenario ${idx + 1}...`}
                                                                        value={(userScenarios[user._id]?.[idx]) || ''}
                                                                        onChange={(e) => setUserScenarios((prev) => {
                                                                            const current = prev[user._id] || ['', '', ''];
                                                                            const next: [string, string, string] = [...current] as [string, string, string];
                                                                            next[idx] = e.target.value;
                                                                            return { ...prev, [user._id]: next };
                                                                        })}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Lyrics */}
                                                        <div className="space-y-3">
                                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                                <Music className="w-4 h-4 text-blush-deep" />
                                                                Lyrics
                                                            </Label>
                                                            <textarea
                                                                className="w-full min-h-[140px] rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 focus:border-blush/50 transition-all resize-none placeholder:text-muted-foreground/60 hover:bg-muted/30"
                                                                placeholder="Paste or write lyrics here..."
                                                                value={userLyrics[user._id] || ''}
                                                                onChange={(e) => setUserLyrics((prev) => ({ ...prev, [user._id]: e.target.value }))}
                                                            />
                                                        </div>

                                                        {/* Message */}
                                                        <div className="space-y-3">
                                                            <Label className="text-sm font-semibold">Message</Label>
                                                            <textarea
                                                                className="w-full min-h-[100px] rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 focus:border-blush/50 transition-all resize-none placeholder:text-muted-foreground/60 hover:bg-muted/30"
                                                                placeholder="Write a message to the recipient..."
                                                                value={userMessage[user._id] || ''}
                                                                onChange={(e) => setUserMessage((prev) => ({ ...prev, [user._id]: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="px-6 py-4 border-t border-border/30 bg-muted/10 gap-3">
                                                        <DialogClose asChild>
                                                            <Button type="button" variant="outline" className="rounded-xl">Cancel</Button>
                                                        </DialogClose>
                                                        <Button
                                                            type="button"
                                                            variant="hero"
                                                            className="rounded-xl"
                                                            disabled={!!isUploading[user._id]}
                                                            onClick={async () => {
                                                                const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || (import.meta as any).env?.REACT_APP_CLOUDINARY_CLOUD_NAME;
                                                                const imgPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || (import.meta as any).env?.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
                                                                const audioPreset = (import.meta as any).env?.VITE_CLOUDINARY_AUDIO_UPLOAD_PRESET || (import.meta as any).env?.REACT_APP_CLOUDINARY_AUDIO_UPLOAD_PRESET || imgPreset;

                                                                if (!cloudName || !imgPreset) {
                                                                    toast.error('Cloudinary not configured', { description: 'Please set Cloudinary env vars.' });
                                                                    return;
                                                                }

                                                                // Validate required fields
                                                                const images = userPhotos[user._id] || [];
                                                                const audio = userAudio[user._id] || null;
                                                                const memory = userMemoryType[user._id];
                                                                const plan = userPlan[user._id];

                                                                // Auto-map occasion to template
                                                                const getTemplateFromOccasion = (occasion: string): string => {
                                                                    switch (occasion) {
                                                                        case 'birthday':
                                                                            return 'birthday-celebration';
                                                                        case 'anniversary':
                                                                            return 'grand-anniversary';
                                                                        case 'valentines':
                                                                            return 'minimalist-love';
                                                                        default:
                                                                            return 'minimalist-love';
                                                                    }
                                                                };

                                                                const templateId = memory ? getTemplateFromOccasion(memory) : 'minimalist-love';
                                                                const scenarios = (userScenarios[user._id] || []).filter(Boolean);
                                                                const lyrics = userLyrics[user._id] || '';
                                                                const message = userMessage[user._id] || '';

                                                                if (images.length === 0 && !audio) {
                                                                    toast.error('Missing files', { description: 'Please upload at least one image or audio file.' });
                                                                    return;
                                                                }
                                                                if (!memory) {
                                                                    toast.error('Missing occasion', { description: 'Please select an occasion type.' });
                                                                    return;
                                                                }
                                                                if (!plan) {
                                                                    toast.error('Missing plan', { description: 'Please select a plan.' });
                                                                    return;
                                                                }

                                                                setIsUploading((prev) => ({ ...prev, [user._id]: true }));
                                                                setUploadError((prev) => ({ ...prev, [user._id]: null }));

                                                                try {
                                                                    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';

                                                                    // Step 1: Get the count of existing gifts for this user to determine folder name
                                                                    let giftNumber = 1;
                                                                    try {
                                                                        const giftsRes = await fetch(`${API_BASE}/api/admin/users/${user._id}/gifts`, {
                                                                            headers: { Authorization: `Bearer ${token}` },
                                                                        });
                                                                        if (giftsRes.ok) {
                                                                            const giftsData = await giftsRes.json();
                                                                            giftNumber = (giftsData?.gifts?.length || 0) + 1;
                                                                        }
                                                                    } catch (e) {
                                                                        console.warn('Could not fetch existing gifts count, using default:', e);
                                                                    }

                                                                    // Step 2: Upload files to Cloudinary with folder structure: MemoryHaze/userId/gift{n}/
                                                                    // Use userId if available, otherwise fallback to _id
                                                                    const userFolder = user.userId || user._id;
                                                                    if (!userFolder) {
                                                                        toast.error('User ID missing', { description: 'Cannot create gift without user identifier.' });
                                                                        setIsUploading((prev) => ({ ...prev, [user._id]: false }));
                                                                        return;
                                                                    }
                                                                    const folderPath = `MemoryHaze/${userFolder}/gift${giftNumber}`;

                                                                    const uploadImage = async (file: File, index: number) => {
                                                                        const fd = new FormData();
                                                                        fd.append('file', file);
                                                                        fd.append('upload_preset', imgPreset);
                                                                        // Use separate folder parameter for proper folder structure
                                                                        fd.append('folder', folderPath);
                                                                        fd.append('public_id', `photo_${index + 1}`);

                                                                        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                                                            method: 'POST',
                                                                            body: fd,
                                                                        });
                                                                        if (!res.ok) {
                                                                            const errorData = await res.json().catch(() => ({}));
                                                                            throw new Error(errorData?.error?.message || 'Image upload failed');
                                                                        }
                                                                        const data = await res.json();
                                                                        return data.secure_url as string;
                                                                    };

                                                                    const uploadAudio = async (file: File) => {
                                                                        const fd = new FormData();
                                                                        fd.append('file', file);
                                                                        fd.append('upload_preset', audioPreset);
                                                                        // Use separate folder parameter for proper folder structure
                                                                        fd.append('folder', folderPath);
                                                                        fd.append('public_id', 'audio');

                                                                        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
                                                                            method: 'POST',
                                                                            body: fd,
                                                                        });
                                                                        if (!res.ok) {
                                                                            const errorData = await res.json().catch(() => ({}));
                                                                            throw new Error(errorData?.error?.message || 'Audio upload failed');
                                                                        }
                                                                        const data = await res.json();
                                                                        return data.secure_url as string;
                                                                    };

                                                                    // Upload images
                                                                    const imagePromises = images.map((f, idx) => uploadImage(f, idx));
                                                                    const imageResults = await Promise.allSettled(imagePromises);
                                                                    const succeededImages = imageResults
                                                                        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
                                                                        .map((r) => r.value);
                                                                    const failedImages = imageResults.filter((r) => r.status === 'rejected').length;

                                                                    // Upload audio
                                                                    let uploadedAudioUrl: string | null = null;
                                                                    let audioFailed = false;
                                                                    if (audio) {
                                                                        try {
                                                                            uploadedAudioUrl = await uploadAudio(audio);
                                                                        } catch (e) {
                                                                            console.error('Audio upload error:', e);
                                                                            audioFailed = true;
                                                                        }
                                                                    }

                                                                    // Step 3: Save gift to backend
                                                                    const payload = {
                                                                        userId: user._id,
                                                                        templateId,
                                                                        scenarios,
                                                                        memory,
                                                                        plan,
                                                                        photos: succeededImages,
                                                                        audio: uploadedAudioUrl,
                                                                        lyrics,
                                                                        message,
                                                                    };

                                                                    const saveRes = await fetch(`${API_BASE}/api/admin/gifts`, {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            Authorization: `Bearer ${token}`,
                                                                        },
                                                                        body: JSON.stringify(payload),
                                                                    });

                                                                    if (!saveRes.ok) {
                                                                        const saveData = await saveRes.json().catch(() => ({}));
                                                                        console.error('Backend error response:', saveData);

                                                                        let errorMsg = saveData?.error || 'Failed to create gift record';
                                                                        if (saveData?.message) {
                                                                            errorMsg += ': ' + saveData.message;
                                                                        }
                                                                        if (saveData?.details) {
                                                                            const detailsStr = saveData.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
                                                                            errorMsg += ' (' + detailsStr + ')';
                                                                        }

                                                                        throw new Error(errorMsg);
                                                                    }

                                                                    const savedGift = await saveRes.json();

                                                                    // Step 4: Update local state
                                                                    setImageUrlsByUser((prev) => ({ ...prev, [user._id]: succeededImages }));
                                                                    setAudioUrlByUser((prev) => ({ ...prev, [user._id]: uploadedAudioUrl }));

                                                                    // Step 5: Clear form data for this user
                                                                    setUserPhotos((prev) => ({ ...prev, [user._id]: [] }));
                                                                    setUserAudio((prev) => ({ ...prev, [user._id]: null }));
                                                                    setUserScenarios((prev) => ({ ...prev, [user._id]: ['', '', ''] }));
                                                                    setUserMemoryType((prev) => ({ ...prev, [user._id]: '' }));
                                                                    setUserPlan((prev) => ({ ...prev, [user._id]: '' }));
                                                                    setUserLyrics((prev) => ({ ...prev, [user._id]: '' }));
                                                                    setUserMessage((prev) => ({ ...prev, [user._id]: '' }));

                                                                    // Step 6: Refresh the gifts list if this user is selected
                                                                    if (selectedUser && selectedUser._id === user._id) {
                                                                        await fetchUserGifts(selectedUser, true);
                                                                    }

                                                                    // Show success message
                                                                    if (failedImages || audioFailed) {
                                                                        const parts = [] as string[];
                                                                        if (failedImages) parts.push(`${failedImages} image(s) failed`);
                                                                        if (audioFailed) parts.push('audio failed');
                                                                        toast.warning('Gift created with some upload failures', {
                                                                            description: parts.join(', ')
                                                                        });
                                                                    } else {
                                                                        toast.success('Gift created successfully!', {
                                                                            description: `${succeededImages.length} image(s)${uploadedAudioUrl ? ' + audio' : ''} uploaded to folder: ${folderPath}`
                                                                        });
                                                                    }

                                                                    // Close the dialog
                                                                    const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLElement;
                                                                    closeButton?.click();

                                                                } catch (err: any) {
                                                                    console.error('Gift creation error:', err);
                                                                    setUploadError((prev) => ({ ...prev, [user._id]: err?.message || 'Upload failed' }));
                                                                    toast.error('Failed to create gift', { description: err?.message || 'An error occurred' });
                                                                } finally {
                                                                    setIsUploading((prev) => ({ ...prev, [user._id]: false }));
                                                                }
                                                            }}
                                                        >
                                                            {isUploading[user._id] ? 'Creating Gift…' : 'Create Gift'}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {selectedUser && (
                            <div className="mt-8 rounded-2xl border border-border bg-white/70 backdrop-blur p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Gifts for</div>
                                        <div className="font-semibold text-foreground truncate">{selectedUser.email}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchUserGifts(selectedUser, true)}
                                            disabled={giftsRefreshing}
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${giftsRefreshing ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                {giftsLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : selectedUserGifts.length === 0 ? (
                                    <div className="text-sm text-muted-foreground py-6">No gifts for this user yet.</div>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {selectedUserGifts.map((g) => {
                                            const isDeleted = !!g.permanentlyDeleted;
                                            const enabled = !!g.accessEnabled;
                                            const remaining = formatRemaining(g);
                                            return (
                                                <div key={g._id} className="rounded-xl border border-border bg-white p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <div className="font-semibold truncate">{g.templateId}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Created: {new Date(g.createdAt).toLocaleString()}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {g.plan ? `Plan: ${g.plan}` : null}
                                                                {g.plan && g.memory ? ' • ' : null}
                                                                {g.memory ? `Occasion: ${formatOccasion(g.memory)}` : null}
                                                            </div>
                                                            <div className="text-sm mt-2">
                                                                <span className="text-muted-foreground">Remaining: </span>
                                                                <span className={remaining === 'Expired' || remaining === 'Deleted' ? 'text-destructive' : 'text-foreground'}>
                                                                    {remaining}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm mt-1">
                                                                <span className="text-muted-foreground">Access: </span>
                                                                <span className={enabled && !isDeleted ? 'text-foreground' : 'text-destructive'}>
                                                                    {isDeleted ? 'Deleted' : enabled ? 'Enabled' : 'Disabled/Expired'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={isDeleted}
                                                                onClick={() => {
                                                                    const nextEnabled = !enabled;
                                                                    openConfirm({
                                                                        title: nextEnabled ? 'Grant access?' : 'Revoke access?',
                                                                        description: nextEnabled
                                                                            ? 'This user will be able to open this gift again.'
                                                                            : 'This user will no longer be able to open this gift.',
                                                                        actionLabel: nextEnabled ? 'Grant' : 'Revoke',
                                                                        destructive: !nextEnabled,
                                                                        onConfirm: () => updateGiftAccess(g._id, nextEnabled),
                                                                    });
                                                                }}
                                                            >
                                                                {enabled ? 'Revoke' : 'Grant'}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    openConfirm({
                                                                        title: 'Permanently delete this gift?',
                                                                        description: 'This will remove the uploaded assets and permanently revoke access. This action cannot be undone.',
                                                                        actionLabel: 'Delete permanently',
                                                                        destructive: true,
                                                                        onConfirm: () => permanentlyDeleteGift(g._id),
                                                                    });
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Permanent
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1 || isLoading}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="px-4 py-1 bg-muted/30 rounded text-sm">
                                    {page} / {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || isLoading}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Back Button */}
                <div className="flex justify-center">
                    <Link to="/">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
