import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Search, Loader2, ChevronLeft, ChevronRight, Eye, EyeOff, PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

interface User {
    _id: string;
    email: string;
    createdAt: string;
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
    const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
    const [uploadError, setUploadError] = useState<Record<string, string | null>>({});
    const [imageUrlsByUser, setImageUrlsByUser] = useState<Record<string, string[]>>({});
    const [audioUrlByUser, setAudioUrlByUser] = useState<Record<string, string | null>>({});

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
        } catch (err:any) {
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
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                                <span className="text-sm font-medium text-primary">
                                                    {user.email[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="truncate">{user.email}</span>
                                        </div>
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
                                                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[98vw] sm:w-auto max-w-5xl max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl">Create for {user.email}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-6 text-foreground">
                                                        <div>
                                                            <label className="text-sm font-semibold">Upload Photos</label>
                                                            <label htmlFor={`photo-upload-${user._id}`} className="mt-2 w-full h-40 rounded-xl border-2 border-dashed border-border bg-white hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-center text-base text-muted-foreground">
                                                                Click to select up to 4 images
                                                            </label>
                                                            <input
                                                                id={`photo-upload-${user._id}`}
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                className="hidden"
                                                                onChange={(e) => handlePhotosChange(user._id, e.target.files)}
                                                            />
                                                            <p className="mt-2 text-xs text-muted-foreground">Up to 4 photos</p>
                                                            {(userPhotos[user._id] || []).length > 0 && (
                                                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                                    {(userPhotos[user._id] || []).map((file, idx) => (
                                                                        <div key={idx} className="relative group w-full aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                                                                            <img
                                                                                src={URL.createObjectURL(file)}
                                                                                alt={`Photo ${idx + 1}`}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removePhotoAt(user._id, idx)}
                                                                                className="absolute top-1 right-1 text-xs bg-foreground/80 text-primary-foreground rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                aria-label="Remove photo"
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-semibold">Upload Audio</label>
                                                            <label htmlFor={`audio-upload-${user._id}`} className="mt-2 w-full h-28 rounded-xl border-2 border-dashed border-border bg-white hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-center text-base text-muted-foreground">
                                                                Click to select an audio file
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
                                                        <div className="grid md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="text-sm font-semibold">Memory</label>
                                                                <select
                                                                    className="mt-2 w-full h-11 rounded-lg border border-border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                                                                    value={userMemoryType[user._id] || ''}
                                                                    onChange={(e) => setUserMemoryType((prev) => ({ ...prev, [user._id]: e.target.value }))}
                                                                >
                                                                    <option value="" disabled>Select memory</option>
                                                                    <option value="birthday">Birthday</option>
                                                                    <option value="anniversary">Anniversary</option>
                                                                    <option value="valentines">Valentine</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-semibold">Plan</label>
                                                                <select
                                                                    className="mt-2 w-full h-11 rounded-lg border border-border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                                                                    value={userPlan[user._id] || ''}
                                                                    onChange={(e) => setUserPlan((prev) => ({ ...prev, [user._id]: e.target.value }))}
                                                                >
                                                                    <option value="" disabled>Select plan</option>
                                                                    <option value="momentum">Momentum</option>
                                                                    <option value="everlasting">Everlasting</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-semibold">Scenarios</label>
                                                            <div className="mt-2 space-y-4">
                                                                {([0,1,2] as const).map((idx) => (
                                                                    <textarea
                                                                        key={idx}
                                                                        className="w-full min-h-[180px] rounded-lg border border-border bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                                        placeholder={`Scenario ${idx + 1}`}
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
                                                        <div>
                                                            <label className="text-sm font-semibold">Theme</label>
                                                            <select
                                                                className="mt-2 w-full h-11 rounded-lg border border-border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                                                                value={userTemplateId[user._id] || 'minimalist-love'}
                                                                onChange={(e) => setUserTemplateId((prev) => ({ ...prev, [user._id]: e.target.value }))}
                                                            >
                                                                <option value="minimalist-love">Minimalist Love</option>
                                                                <option value="grand-anniversary">Grand Anniversary</option>
                                                                <option value="birthday-celebration">Birthday Celebration</option>
                                                                <option value="romantic-evening">Romantic Evening</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-semibold">Lyrics</label>
                                                            <textarea
                                                                className="mt-2 w-full min-h-[180px] rounded-lg border border-border bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                                placeholder="Paste or write lyrics here..."
                                                                value={userLyrics[user._id] || ''}
                                                                onChange={(e) => setUserLyrics((prev) => ({ ...prev, [user._id]: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button type="button" variant="outline">Cancel</Button>
                                                        </DialogClose>
                                                        <Button
                                                            type="button"
                                                            disabled={!!isUploading[user._id]}
                                                            onClick={async () => {
                                                                const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || (import.meta as any).env?.REACT_APP_CLOUDINARY_CLOUD_NAME;
                                                                const imgPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || (import.meta as any).env?.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
                                                                const audioPreset = (import.meta as any).env?.VITE_CLOUDINARY_AUDIO_UPLOAD_PRESET || (import.meta as any).env?.REACT_APP_CLOUDINARY_AUDIO_UPLOAD_PRESET || imgPreset;
                                                                if (!cloudName || !imgPreset) {
                                                                    toast.error('Cloudinary not configured', { description: 'Please set Cloudinary env vars.' });
                                                                    return;
                                                                }
                                                                const images = userPhotos[user._id] || [];
                                                                const audio = userAudio[user._id] || null;
                                                                if (images.length === 0 && !audio) {
                                                                    toast.error('Nothing to upload', { description: 'Add up to 4 images and/or one audio file.' });
                                                                    return;
                                                                }
                                                                setIsUploading((prev) => ({ ...prev, [user._id]: true }));
                                                                setUploadError((prev) => ({ ...prev, [user._id]: null }));
                                                                try {
                                                                    const uploadImage = async (file: File) => {
                                                                        const fd = new FormData();
                                                                        fd.append('file', file);
                                                                        fd.append('upload_preset', imgPreset);
                                                                        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                                                            method: 'POST',
                                                                            body: fd,
                                                                        });
                                                                        if (!res.ok) throw new Error('Image upload failed');
                                                                        const data = await res.json();
                                                                        return data.secure_url as string;
                                                                    };
                                                                    const uploadAudio = async (file: File) => {
                                                                        const fd = new FormData();
                                                                        fd.append('file', file);
                                                                        fd.append('upload_preset', audioPreset);
                                                                        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
                                                                            method: 'POST',
                                                                            body: fd,
                                                                        });
                                                                        if (!res.ok) throw new Error('Audio upload failed');
                                                                        const data = await res.json();
                                                                        return data.secure_url as string;
                                                                    };

                                                                    const imagePromises = images.map((f) => uploadImage(f));
                                                                    const imageResults = await Promise.allSettled(imagePromises);
                                                                    const succeededImages = imageResults
                                                                        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
                                                                        .map((r) => r.value);
                                                                    const failedImages = imageResults.filter((r) => r.status === 'rejected').length;

                                                                    let uploadedAudioUrl: string | null = null;
                                                                    let audioFailed = false;
                                                                    if (audio) {
                                                                        try {
                                                                            uploadedAudioUrl = await uploadAudio(audio);
                                                                        } catch (e) {
                                                                            audioFailed = true;
                                                                        }
                                                                    }

                                                                    setImageUrlsByUser((prev) => ({ ...prev, [user._id]: succeededImages }));
                                                                    setAudioUrlByUser((prev) => ({ ...prev, [user._id]: uploadedAudioUrl }));

                                                                    // Persist gift record (frontend -> backend)
                                                                    try {
                                                                        const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
                                                                        const payload = {
                                                                            userId: user._id,
                                                                            templateId: userTemplateId[user._id] || 'minimalist-love',
                                                                            scenarios: (userScenarios[user._id] || []).filter(Boolean),
                                                                            memory: userMemoryType[user._id] || null,
                                                                            plan: userPlan[user._id] || null,
                                                                            photos: succeededImages,
                                                                            audio: uploadedAudioUrl,
                                                                            lyrics: userLyrics[user._id] || '',
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
                                                                            toast.error('Saved upload, but failed to create gift', { description: saveData?.error || 'Server error' });
                                                                        }
                                                                    } catch {
                                                                        toast.error('Saved upload, but failed to create gift', { description: 'Failed to connect to server' });
                                                                    }

                                                                    if (failedImages || audioFailed) {
                                                                        const parts = [] as string[];
                                                                        if (failedImages) parts.push(`${failedImages} image(s) failed`);
                                                                        if (audioFailed) parts.push('audio failed');
                                                                        setUploadError((prev) => ({ ...prev, [user._id]: parts.join(', ') }));
                                                                        toast.error('Upload partially succeeded', { description: parts.join(', ') });
                                                                    } else {
                                                                        toast.success('Upload complete', { description: `${succeededImages.length} image(s)${uploadedAudioUrl ? ' + audio' : ''} uploaded.` });
                                                                    }
                                                                } catch (err: any) {
                                                                    setUploadError((prev) => ({ ...prev, [user._id]: err?.message || 'Upload failed' }));
                                                                    toast.error('Upload failed', { description: err?.message || 'Cloudinary error' });
                                                                } finally {
                                                                    setIsUploading((prev) => ({ ...prev, [user._id]: false }));
                                                                }
                                                            }}
                                                        >
                                                            {isUploading[user._id] ? 'Uploading…' : 'Upload'}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                ))}
                            </>
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
