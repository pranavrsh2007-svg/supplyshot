// Mock trucks API — stores data in localStorage

const STORAGE_KEY = "truckAI_truckData";

const DEFAULT_TRUCK = {
  _id: "local_truck_001",
  number: "MH12AB1234",
  type: "Trailer",
  make: "Tata Motors",
  model: "Prima 4028.S",
  capacity: "20 Tons",
  fuelType: "Diesel",
  year: 2022,
  color: "White",
  odometer: "48,320 km",
  lastService: "2025-12-01",
  nextService: "2026-06-01",
  insurance: "Active",
  insuranceExpiry: "2026-12-31",
  permit: "MH/NP/2026/78934",
  fitnessExpiry: "2027-01-15",
  status: "operational",
};

export const getTruck = async () => {
  await new Promise((r) => setTimeout(r, 300));
  const saved = localStorage.getItem(STORAGE_KEY);
  return { data: saved ? JSON.parse(saved) : DEFAULT_TRUCK };
};

export const saveTruck = async (data) => {
  await new Promise((r) => setTimeout(r, 400));
  const updated = { ...DEFAULT_TRUCK, ...data, _id: "local_truck_001" };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return { data: updated };
};
