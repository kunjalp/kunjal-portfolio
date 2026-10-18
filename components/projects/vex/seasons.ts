export type Kind = "ring" | "disc" | "tri";
export type Goal = "mogo" | "hexgoal" | "box" | "net";

export const SEASONS: { id: string; years: string; game: string; piece: Kind; goal: Goal; note: string }[] = [
  { id: "tp", years: "2021–22", game: "Tipping Point", piece: "ring", goal: "mogo", note: "Rings go onto mobile goals." },
  { id: "su", years: "2022–23", game: "Spin Up", piece: "disc", goal: "box", note: "Discs go into the goals." },
  { id: "ou", years: "2023–24", game: "Over Under", piece: "tri", goal: "net", note: "Triballs go into the goal." },
  { id: "hs", years: "2024–25", game: "High Stakes", piece: "ring", goal: "hexgoal", note: "Rings go onto stakes." },
];

export const W = 480, H = 210, TILE = 35;
export const ZONE = { x: 318, y: 26, w: 144, h: 170 };
export const GX = ZONE.x + ZONE.w / 2; // goal center x
export const START: [number, number][] = [
  [42, 160], [86, 176], [128, 152], [60, 112], [108, 118], [168, 178], [34, 66], [150, 92],
];

export type P = { x: number; y: number; slot: number | null };
export const fresh = (): P[] => START.map(([x, y]) => ({ x, y, slot: null }));

// Over Under goal, seen from the side: mouth faces the field (left).
export const NET_X = ZONE.x + 12;
export const NET_TOP = 96;
export const NET_SLOTS: [number, number][] = [
  [22, 172], [48, 172], [74, 172], [100, 172], [22, 147], [48, 147], [74, 147], [34, 122],
];

export function slotPos(goal: Goal, n: number) {
  if (goal === "mogo" || goal === "hexgoal") return { x: GX, y: 170 - n * 11 };
  if (goal === "box") return { x: GX + (n % 2 ? 13 : -13), y: 143 - Math.floor(n / 2) * 7 };
  const [dx, y] = NET_SLOTS[n] ?? NET_SLOTS[NET_SLOTS.length - 1];
  return { x: NET_X + dx, y };
}
