// Mock documents API — stores metadata in localStorage, uses object URLs for preview

const STORAGE_KEY = "truckAI_documents";

function loadDocs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveDocs(docs) {
  // Strip objectURL before saving (can't be serialised across sessions)
  const clean = docs.map(({ objectUrl: _, ...rest }) => rest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
}

export const uploadDocument = async (formData, onProgress) => {
  const file = formData.get("file");
  const linkedTo = formData.get("linkedTo");
  const linkedType = formData.get("linkedType") || "user";

  if (!file) throw { response: { data: { error: "No file provided." } } };

  // Simulate progress
  for (let p = 0; p <= 100; p += 20) {
    await new Promise((r) => setTimeout(r, 60));
    onProgress?.(p);
  }

  const objectUrl = URL.createObjectURL(file);
  const doc = {
    _id: "doc_" + Date.now(),
    fileName: file.name,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    url: objectUrl,   // object URL — valid for current session only
    objectUrl,        // keep ref for cleanup
    linkedTo,
    linkedType,
    createdAt: new Date().toISOString(),
  };

  const docs = loadDocs();
  docs.unshift(doc);
  saveDocs(docs);

  return { data: doc };
};

export const getDocuments = async ({ linkedTo, linkedType } = {}) => {
  await new Promise((r) => setTimeout(r, 200));
  const all = loadDocs();
  const filtered = all.filter((d) => {
    if (linkedTo && d.linkedTo !== linkedTo) return false;
    if (linkedType && d.linkedType !== linkedType) return false;
    return true;
  });
  return { data: filtered };
};

export const deleteDocument = async (id) => {
  await new Promise((r) => setTimeout(r, 200));
  const docs = loadDocs();
  const updated = docs.filter((d) => d._id !== id);
  saveDocs(updated);
  return { data: { message: "Deleted." } };
};
