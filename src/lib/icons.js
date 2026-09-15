const ICONS = {
  Gym: "🏋️",
  Spa: "💆",
  "Yoga Studio": "🧘",
  "Activity Centre": "⚽",
};

export const PLACE_TYPES = Object.keys(ICONS);

export function iconForType(type) {
  return ICONS[type] ?? "🏃";
}
