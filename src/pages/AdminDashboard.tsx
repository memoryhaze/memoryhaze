import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Search, Loader2, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
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
                                <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-muted/30 rounded-lg font-medium text-sm">
                                    <div>Email</div>
                                    <div className="text-right">Joined</div>
                                </div>

                                {/* Table Rows */}
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors"
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
