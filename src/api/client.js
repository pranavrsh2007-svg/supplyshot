// Placeholder — no backend. All API calls use local mock implementations.
// This file is kept so existing imports don't break.
// Ready for future Firebase or backend integration.

const client = {
  get: () => Promise.resolve({ data: {} }),
  post: () => Promise.resolve({ data: {} }),
  patch: () => Promise.resolve({ data: {} }),
  delete: () => Promise.resolve({ data: {} }),
};

export default client;
