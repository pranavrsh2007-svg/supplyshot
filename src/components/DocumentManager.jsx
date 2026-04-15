import { useState, useRef, useEffect } from "react";
import { useTheme, useAuth } from "../context/AppContext";
import {
  FileText, X, CheckCircle, AlertCircle, CloudUpload, Loader2, RefreshCw, File, Eye
} from "lucide-react";

export default function DocumentManager({ title = "Documents" }) {
  const { darkMode } = useTheme();
  const { user } = useAuth(); // Single source of truth
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef(null);

  // Load existing file data initially and whenever user changes
  useEffect(() => {
    if (!user) return;
    const savedFile = localStorage.getItem(`user_file_${user.uid}`);
    if (savedFile) {
      try {
        const parsed = JSON.parse(savedFile);
        setFileData(parsed);
      } catch (e) {
        // Fallback for previous raw base64 uploads
        setFileData({ name: "Document", type: "unknown", data: savedFile });
      }
    } else {
      setFileData(null);
    }
  }, [user]);

  // ── Auto-clear messages ────────────────────────────────────────────────────
  useEffect(() => {
    if (error)   { const t = setTimeout(() => setError(null), 4000); return () => clearTimeout(t); }
  }, [error]);
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
  }, [success]);

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleFileUpload = (file, user) => {
    try {
      if (!file) throw new Error("No file selected");
      if (!user) throw new Error("No active user");

      // limit file size (important) -> max 2MB
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("File too large (Max 2MB)");
      }

      setLoading(true);

      const reader = new FileReader();

      reader.onload = () => {
        try {
          const newFileData = {
            name: file.name,
            type: file.type,
            data: reader.result
          };
          const key = `user_file_${user.uid}`;

          localStorage.setItem(key, JSON.stringify(newFileData));
          setFileData(newFileData);
          setError(null);
          setSuccess("File uploaded successfully");
          
          console.log("File uploaded successfully");
        } catch (e) {
          setError("Saving failed (Storage quota exceeded)");
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("File reading failed");
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, user);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file, user);
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
          <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#991b1b" }}>
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
        onClick={() => !loading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "#0B5ED7" : darkMode ? "#30363d" : "#cbd5e1"}`,
          borderRadius: 14, padding: "28px 20px", textAlign: "center",
          cursor: loading ? "wait" : "pointer",
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
          accept=".pdf,.jpg,.png"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        {loading ? (
          <div>
            <Loader2 size={32} color="#0B5ED7" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Converting & Saving Data...</p>
          </div>
        ) : (
          <>
            <CloudUpload size={36} color={dragging ? "#0B5ED7" : darkMode ? "#475569" : "#94a3b8"} style={{ margin: "0 auto 10px" }} />
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: dragging ? "#0B5ED7" : "inherit" }}>
              {dragging ? "Drop to upload!" : "Drag & drop or click to upload"}
            </p>
            <p style={{ fontSize: 12, opacity: 0.55 }}>PDF, JPG, PNG · Max 2 MB</p>
          </>
        )}
      </div>

      {/* Display single uploaded file */}
      {!fileData ? (
        <div style={{
          ...card, padding: "28px 20px", textAlign: "center", opacity: 0.55,
        }}>
          <File size={28} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>No file uploaded yet</p>
        </div>
      ) : (
        <div
          style={{
            ...card, padding: "12px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(11,94,215,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              fontSize: 18
            }}>
              {fileData.type?.includes("pdf") ? "📄" : "🖼️"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Active Profile Document</div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                {fileData.name}
              </div>
            </div>
          </div>

          <a
            href={fileData.data}
            target="_blank"
            rel="noopener noreferrer"
            title="View document"
            className="btn"
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
              color: "white", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
            }}
          >
            <Eye size={13} /> View File
          </a>
        </div>
      )}
    </div>
  );
}
