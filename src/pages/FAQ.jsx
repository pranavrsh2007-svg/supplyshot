import { useState } from "react";
import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

;

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const { darkMode } = useTheme();

  return (
    <div className="faq-item">
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", padding: "16px 18px",
          background: "none", border: "none", cursor: "pointer",
          color: "inherit", textAlign: "left", gap: 12
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.5 }}>{q}</span>
        <span style={{ flexShrink: 0, color: "#0B5ED7" }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div style={{
          padding: "0 18px 16px", fontSize: 14, lineHeight: 1.8, opacity: 0.8,
          borderTop: `1px solid ${darkMode ? "#30363d" : "#f1f5f9"}`,
          paddingTop: 14, marginTop: -4
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(t("faq.all"));

  const faqData = t("faqData", { returnObjects: true }) || [];
  const allCategories = [t("faq.all"), ...(faqData.map ? faqData.map((c) => c.category) : [])];

  const filtered = faqData
    .filter((cat) => activeCategory === t("faq.all") || cat.category === activeCategory)
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (item) =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>❓ {t("faq.title")}</h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>{t("faq.subtitle")}</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 480, marginBottom: 24 }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#0B5ED7" }} />
        <input
          className="input-field" type="text"
          placeholder={t("faq.searchPlaceholder")}
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 42, fontSize: 15, padding: "12px 14px 12px 42px" }}
        />
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {allCategories.map((cat) => {
          const catData = faqData.find((c) => c.category === cat);
          const color = catData?.color || "#0B5ED7";
          const active = activeCategory === cat;
          return (
            <button
              key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 16px", borderRadius: 20,
                border: `1.5px solid ${active ? color : (darkMode ? "#30363d" : "#e1e8f0")}`,
                background: active ? `${color}15` : "transparent",
                color: active ? color : "inherit",
                cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s"
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* FAQ list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", opacity: 0.5 }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>{t("faq.noResults")}</p>
          <p style={{ fontSize: 14 }}>{t("faq.noResultsDesc")}</p>
        </div>
      ) : (
        filtered.map((cat) => (
          <div key={cat.category} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: cat.color }} />
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{cat.category}</h2>
              <span style={{ fontSize: 12, opacity: 0.6 }}>{cat.faqs.length} question{cat.faqs.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cat.faqs.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Still have questions? */}
      <div style={{
        marginTop: 24, padding: "24px 28px", borderRadius: 14,
        background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
        color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap"
      }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{t("faq.stillHaveQuestions")}</h3>
          <p style={{ fontSize: 14, opacity: 0.85 }}>{t("faq.supportAvailable")}</p>
        </div>
        <a
          href="/contact"
          style={{
            background: "white", color: "#0B5ED7",
            padding: "12px 24px", borderRadius: 10,
            textDecoration: "none", fontWeight: 700, fontSize: 14, flexShrink: 0
          }}
        >
          {t("faq.contactSupport")}
        </a>
      </div>
    </div>
  );
}
