import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../context/AppContext";
import { uploadDocument, getDocuments, deleteDocument } from "../api/documents";
import {
  Upload, FileText, Image, File, Trash2, Eye, X,
  CheckCircle, AlertCircle, CloudUpload, Loader2, RefreshCw,
} from "lucide-react";

const ACCEPT_TYPES = ".pdf,.jpg,.jpeg,.png";
const MAX_SIZE_MB = 10;

function FileIcon({ mime }) {
  if (mime === "application/pdf") return <FileText size={20} color="#DC3545" />;
  if (mime?.startsWith("image/")) return <Image size={20} color="#0B5ED7" />;
  return <File size={20} color="#6366f1" />;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function DocumentManager({ linkedTo, linkedType = "user", title = "Documents" }) {
  const { darkMode } = useTheme();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  // ── Fetch documents ────────────────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    const effectiveLinkedTo = linkedTo || "local_user";
    setLoading(true);
    try {
      const { data } = await getDocuments({ linkedTo: effectiveLinkedTo, linkedType });
      setDocs(data);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [linkedTo, linkedType]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // ── Auto-clear messages ────────────────────────────────────────────────────
  useEffect(() => {
    if (error)   { const t = setTimeout(() => setError(""),   4000); return () => clearTimeout(t); }
  }, [error]);
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
  }, [success]);

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleUpload = async (file) => {
    if (!file) return;
    // Use a fallback key if linkedTo is not provided
    const effectiveLinkedTo = linkedTo || "local_user";
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_SIZE_MB} MB allowed.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("linkedTo", effectiveLinkedTo);
    formData.append("linkedType", linkedType);

    setUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      await uploadDocument(formData, setUploadProgress);
      setSuccess("File uploaded successfully!");
      await fetchDocs();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d._id !== id));
      setSuccess("Document deleted.");
    } catch (err) {
      setError(err.response?.data?.error || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const card = {
    borderRadius: 14,
    border: `1.5px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
    background: darkMode ? "#161b22" : "#ffffff",
    transition: "all 0.2s",
  };

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={18} color="#0B5ED7" /> {title}
        </h3>
        <button
          onClick={fetchDocs}
          title="Refresh"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#0B5ED7", padding: 4, display: "flex", borderRadius: 6,
          }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Toast messages */}
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          background: "#fee2e2", border: "1px solid #fecaca",
          display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#991b1b",
        }}>
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#991b1b" }}>
            <X size={14} />
          </button>
        </div>
      )}
      {success && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          background: "#d1fae5", border: "1px solid #bbf7d0",
          display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#065f46",
        }}>
          <CheckCircle size={15} /> {success}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "#0B5ED7" : darkMode ? "#30363d" : "#cbd5e1"}`,
          borderRadius: 14, padding: "28px 20px", textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragging
            ? darkMode ? "rgba(11,94,215,0.1)" : "#eff6ff"
            : darkMode ? "rgba(255,255,255,0.02)" : "#fafbff",
          transition: "all 0.2s", marginBottom: 16,
          transform: dragging ? "scale(1.01)" : "scale(1)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES}
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        {uploading ? (
          <div>
            <Loader2 size={32} color="#0B5ED7" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Uploading… {uploadProgress}%</p>
            {/* Progress bar */}
            <div style={{ height: 6, borderRadius: 3, background: darkMode ? "#30363d" : "#e2e8f0", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 3,
                width: `${uploadProgress}%`,
                background: "linear-gradient(90deg, #0B5ED7, #60a5fa)",
                transition: "width 0.2s ease",
              }} />
            </div>
          </div>
        ) : (
          <>
            <CloudUpload size={36} color={dragging ? "#0B5ED7" : darkMode ? "#475569" : "#94a3b8"} style={{ margin: "0 auto 10px" }} />
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: dragging ? "#0B5ED7" : "inherit" }}>
              {dragging ? "Drop to upload!" : "Drag & drop or click to upload"}
            </p>
            <p style={{ fontSize: 12, opacity: 0.55 }}>PDF, JPG, PNG · Max {MAX_SIZE_MB} MB</p>
          </>
        )}
      </div>

      {/* Documents list */}
      {loading ? (
        // Skeleton
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 64, borderRadius: 12, overflow: "hidden",
              background: darkMode ? "#1e262f" : "#f1f5f9",
            }}>
              <div style={{
                height: "100%",
                background: darkMode
                  ? "linear-gradient(90deg, #1e262f 0%, #2d3748 50%, #1e262f 100%)"
                  : "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s ease-in-out infinite",
              }} />
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div style={{
          ...card, padding: "28px 20px", textAlign: "center", opacity: 0.55,
        }}>
          <File size={28} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>No documents uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {docs.map((doc) => (
            <div
              key={doc._id}
              style={{
                ...card, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0B5ED7"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,94,215,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e1e8f0"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: doc.mimeType === "application/pdf" ? "rgba(220,53,69,0.1)" : "rgba(11,94,215,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <FileIcon mime={doc.mimeType} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {doc.originalName}
                </div>
                <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                  {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
                </div>
              </div>

              {/* View button */}
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                title="View document"
                style={{
                  padding: "6px 10px", borderRadius: 8,
                  background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
                  color: "white", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <Eye size={13} /> View
              </a>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(doc._id)}
                disabled={deletingId === doc._id}
                title="Delete document"
                style={{
                  padding: "6px 10px", borderRadius: 8,
                  background: "rgba(220,53,69,0.1)",
                  border: "1px solid rgba(220,53,69,0.2)",
                  color: "#DC3545", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
                  flexShrink: 0, transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#DC3545"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(220,53,69,0.1)"; e.currentTarget.style.color = "#DC3545"; }}
              >
                {deletingId === doc._id
                  ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                  : <Trash2 size={13} />
                }
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
