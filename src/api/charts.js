// Mock charts API — generates realistic looking data locally

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildLabels(range) {
  if (range === "daily") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (range === "weekly") return ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
}

export const getFuelData = async (range = "weekly") => {
  await new Promise((r) => setTimeout(r, 180));
  const labels = buildLabels(range);
  return {
    data: {
      range,
      data: labels.map((label) => ({
        label,
        fuel: randomInt(140, 200),
        efficiency: +(Math.random() * 3 + 8).toFixed(1),
      })),
    },
  };
};

export const getDistanceData = async (range = "weekly") => {
  await new Promise((r) => setTimeout(r, 180));
  const labels = buildLabels(range);
  const scale = range === "daily" ? [200, 400] : range === "weekly" ? [1200, 2000] : [5000, 8000];
  return {
    data: {
      range,
      data: labels.map((label) => ({ label, distance: randomInt(...scale) })),
    },
  };
};

export const getMaintenanceData = async (range = "monthly") => {
  await new Promise((r) => setTimeout(r, 180));
  const labels = buildLabels(range);
  const events = ["Oil Change", "Tyre", "Brakes", "Engine", "Filters", "Electrical"];
  return {
    data: {
      range,
      data: labels.map((label) => ({
        label,
        cost: randomInt(1000, 6000),
        event: events[randomInt(0, events.length - 1)],
        count: randomInt(1, 3),
      })),
    },
  };
};
