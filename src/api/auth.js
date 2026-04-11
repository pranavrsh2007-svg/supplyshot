// Mock auth — no backend needed
// All auth state is managed by AppContext (localStorage)

export const signup = async ({ name, email, password, role = "driver", phone = "" }) => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600));
  if (!name || !email || !password) throw { response: { data: { error: "All fields required." } } };
  return {
    data: {
      token: "mock-token-" + Date.now(),
      user: { id: "local_" + Date.now(), name, email, role, phone },
    },
  };
};

export const login = async ({ email, password }) => {
  await new Promise((r) => setTimeout(r, 500));
  if (!email || !password) throw { response: { data: { error: "Email and password required." } } };
  return {
    data: {
      token: "mock-token-" + Date.now(),
      user: { id: "local_user", name: email.split("@")[0], email, role: "driver", phone: "" },
    },
  };
};

export const getMe = async () => {
  const saved = localStorage.getItem("truckUser");
  return { data: { user: saved ? JSON.parse(saved) : null } };
};
