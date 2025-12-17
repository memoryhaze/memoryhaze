import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { toast } from "sonner";
import {
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Music,
    Upload,
    Loader2,
    Calendar,
    User as UserIcon,
    Heart,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Package,
} from "lucide-react";

interface GiftRequest {
    _id: string;
    user: {
        _id: string;
        email: string;
        userId: string;
    };
    recipientName: string;
    occasion: string;
    occasionDate: string;
    songGenre: string;
    scenarios: string[];
    photos: string[];
    plan: string;
    message: string;
    status: "pending" | "verified" | "rejected" | "completed";
    submittedAt: string;
    verifiedAt?: string;
    completedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
}

interface GiftRequestsManagerProps {
    token: string | null;
}

const statusConfig = {
    pending: {
        label: "Pending Review",
        icon: Clock,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
    },
    verified: {
        label: "Verified",
        icon: CheckCircle,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
    },
    completed: {
        label: "Completed",
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
    },
    rejected: {
        label: "Rejected",
        icon: XCircle,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
    },
};

export const GiftRequestsManager = ({ token }: GiftRequestsManagerProps) => {
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "verified" | "completed" | "rejected">("all");
    const [requests, setRequests] = useState<GiftRequest[]>([]);
    const [stats, setStats] = useState({ pending: 0, verified: 0, completed: 0, rejected: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);

    // Complete gift modal state
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<GiftRequest | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [lyrics, setLyrics] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Reject modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";

    useEffect(() => {
        fetchStats();
        fetchRequests();
    }, [activeTab, page]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/requests/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const status = activeTab === "all" ? "all" : activeTab;
            const res = await fetch(
                `${API_BASE}/api/admin/requests?status=${status}&page=${page}&limit=${limit}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests);
                setTotal(data.total);
            } else {
                toast.error("Failed to fetch requests");
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            toast.error("Error loading requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (requestId: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/requests/${requestId}/verify`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                toast.success("Request verified successfully!");
                fetchStats();
                fetchRequests();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to verify request");
            }
        } catch (error) {
            console.error("Verify error:", error);
            toast.error("Error verifying request");
        }
    };

    const handleRejectClick = (request: GiftRequest) => {
        setSelectedRequest(request);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedRequest) return;

        setIsRejecting(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/requests/${selectedRequest._id}/reject`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: rejectReason }),
            });

            if (res.ok) {
                toast.success("Request rejected and files deleted");
                setRejectModalOpen(false);
                fetchStats();
                fetchRequests();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to reject request");
            }
        } catch (error) {
            console.error("Reject error:", error);
            toast.error("Error rejecting request");
        } finally {
            setIsRejecting(false);
        }
    };

    const handleCompleteClick = (request: GiftRequest) => {
        setSelectedRequest(request);
        setAudioFile(null);
        setLyrics("");
        setCompleteModalOpen(true);
    };

    const uploadAudioToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
        const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_AUDIO_UPLOAD_PRESET ||
            (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error("Cloudinary not configured");
        }

        // Extract folder from first photo public ID
        const firstPhotoPublicId = selectedRequest?.photos[0];
        let folderPath = "";

        if (firstPhotoPublicId) {
            // Extract folder from URL or use pattern matching
            const match = firstPhotoPublicId.match(/MemoryHaze\/[^\/]+\/gift\d+/);
            if (match) {
                folderPath = match[0];
            }
        }

        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);
        if (folderPath) {
            fd.append("folder", folderPath);
            fd.append("public_id", "audio");
        }

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
            method: "POST",
            body: fd,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || "Audio upload failed");
        }

        const data = await res.json();
        return { url: data.secure_url, publicId: data.public_id };
    };

    const handleCompleteSubmit = async () => {
        if (!selectedRequest || !audioFile || !lyrics.trim()) {
            toast.error("Please add audio file and lyrics");
            return;
        }

        setIsUploading(true);
        try {
            // Upload audio to Cloudinary
            toast.info("Uploading audio...");
            const { url: audioUrl, publicId: audioPublicId } = await uploadAudioToCloudinary(audioFile);

            // Complete the gift
            const res = await fetch(`${API_BASE}/api/admin/requests/${selectedRequest._id}/complete`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    audio: audioUrl,
                    audioPublicId,
                    lyrics: lyrics.trim(),
                }),
            });

            if (res.ok) {
                toast.success("🎉 Gift created successfully! User has been notified.");
                setCompleteModalOpen(false);
                fetchStats();
                fetchRequests();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to complete gift");
            }
        } catch (error: any) {
            console.error("Complete error:", error);
            toast.error(error.message || "Error completing gift");
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatOccasion = (occasion: string) => {
        switch (occasion) {
            case "birthday": return "Birthday";
            case "anniversary": return "Anniversary";
            case "valentines": return "Valentine's Day";
            default: return occasion;
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(stats).map(([key, value]) => {
                    const config = statusConfig[key as keyof typeof statusConfig];
                    const Icon = config?.icon || Package;

                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${activeTab === key || (activeTab === "all" && key === "total")
                                    ? "border-gold bg-gold/10 shadow-md"
                                    : "border-border/50 hover:border-blush/50 hover:bg-muted/30"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Icon className={`w-5 h-5 ${config?.color || "text-muted-foreground"}`} />
                                <span className="text-2xl font-bold">{value}</span>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                                {key === "total" ? "All Requests" : config?.label || key}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No {activeTab !== "all" && activeTab} requests found</p>
                    </div>
                ) : (
                    requests.map((request) => {
                        const config = statusConfig[request.status];
                        const Icon = config.icon;

                        return (
                            <div
                                key={request._id}
                                className={`border-2 ${config.borderColor} rounded-xl p-6 ${config.bgColor} space-y-4`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">
                                                Gift for {request.recipientName}
                                            </h3>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                                                <Icon className="w-3 h-3" />
                                                {config.label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <UserIcon className="w-4 h-4" />
                                                {request.user.email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatOccasion(request.occasion)} - {formatDate(request.occasionDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Music className="w-4 h-4" />
                                                {request.songGenre}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package className="w-4 h-4" />
                                                {request.plan === "momentum" ? "Momentum (₹499)" : "Everlasting (₹599)"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Photos */}
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{request.photos.length} photo(s)</span>
                                    <div className="flex gap-2 ml-2">
                                        {request.photos.slice(0, 4).map((photo, idx) => (
                                            <img
                                                key={idx}
                                                src={photo}
                                                alt={`Photo ${idx + 1}`}
                                                className="w-12 h-12 rounded-lg object-cover border border-border"
                                            />
                                        ))}
                                        {request.photos.length > 4 && (
                                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                +{request.photos.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Scenarios Preview */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {request.scenarios.map((scenario, idx) => (
                                        <div key={idx} className="p-3 rounded-lg bg-background/50 border border-border/50">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">
                                                Scenario {idx + 1}
                                            </p>
                                            <p className="text-sm line-clamp-2">{scenario}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Message */}
                                {request.message && (
                                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                                            Personal Message
                                        </p>
                                        <p className="text-sm italic">{request.message}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-border/50">
                                    {request.status === "pending" && (
                                        <>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleVerify(request._id)}
                                                className="gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Verify
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRejectClick(request)}
                                                className="gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    {request.status === "verified" && (
                                        <Button
                                            variant="hero"
                                            size="sm"
                                            onClick={() => handleCompleteClick(request)}
                                            className="gap-2"
                                        >
                                            <Music className="w-4 h-4" />
                                            Complete Gift
                                        </Button>
                                    )}
                                    {request.status === "rejected" && request.rejectionReason && (
                                        <div className="text-sm text-red-600">
                                            Reason: {request.rejectionReason}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="gap-2"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Complete Gift Modal */}
            <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Complete Gift - {selectedRequest?.recipientName}</DialogTitle>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6">
                            {/* User Info (Read-only) */}
                            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                                <h4 className="font-semibold">Request Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-muted-foreground">Recipient:</span>
                                    <span>{selectedRequest.recipientName}</span>

                                    <span className="text-muted-foreground">Occasion:</span>
                                    <span>{formatOccasion(selectedRequest.occasion)}</span>

                                    <span className="text-muted-foreground">Date:</span>
                                    <span>{formatDate(selectedRequest.occasionDate)}</span>

                                    <span className="text-muted-foreground">Genre:</span>
                                    <span className="capitalize">{selectedRequest.songGenre}</span>

                                    <span className="text-muted-foreground">Plan:</span>
                                    <span className="capitalize">{selectedRequest.plan}</span>
                                </div>
                            </div>

                            {/* Upload Audio */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Music className="w-4 h-4 text-gold" />
                                    Upload Audio File *
                                </Label>
                                <Input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer"
                                />
                                {audioFile && (
                                    <p className="text-sm text-green-600">✓ {audioFile.name}</p>
                                )}
                            </div>

                            {/* Add Lyrics */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blush-deep" />
                                    Song Lyrics *
                                </Label>
                                <Textarea
                                    placeholder="Enter the song lyrics here..."
                                    value={lyrics}
                                    onChange={(e) => setLyrics(e.target.value)}
                                    className="min-h-[200px] resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {lyrics.length} characters
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCompleteModalOpen(false)}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="hero"
                            onClick={handleCompleteSubmit}
                            disabled={isUploading || !audioFile || !lyrics.trim()}
                            className="gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Complete & Notify User
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <AlertDialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Gift Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the uploaded photos from Cloudinary and mark the request as rejected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2">
                        <Label>Rejection Reason (Optional)</Label>
                        <Textarea
                            placeholder="Why is this request being rejected?"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRejectConfirm}
                            disabled={isRejecting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isRejecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Rejecting...
                                </>
                            ) : (
                                "Reject & Delete Files"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
