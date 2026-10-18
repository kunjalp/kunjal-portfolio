/**
 * The sky follows the visitor's local clock: night, dawn, day, golden hour, sunset.
 * Neighbouring palettes blend smoothly, so 18:00 sits between golden hour and sunset.
 *
 * Only scenery tokens are set (sky, sun, mountains, forest, lake), as inline custom
 * properties on <html>. The light/dark toggle keeps controlling the windows.
 *
 * SKY_JS runs in <head> before first paint (no flash), and SkyClock re-runs it each
 * minute. Add ?hour=20.5 to the URL to preview any time of day.
 *
 * "golden" and "sunset" are the original light and dark scenery palettes.
 */

const KEYS = ["sky-top", "sky-mid", "sky-low", "dusk-top", "dusk-mid", "dusk-low", "sun", "sun-glow", "sun-op", "moon-op", "stars-op", "cloud", "cloud-lit", "bird", "far", "far-lit", "far-snow", "far-snow-lit", "haze", "mid", "mid-lit", "mid-snow", "mid-snow-lit", "strata", "hill-back", "trees-back", "hill-front", "trees-front", "lake-top", "lake-bottom", "shine", "shore", "fore", "dusk-tint", "sun-y"];

const PALETTES: Record<string, (number | number[])[]> = {"night": [[30, 32, 66], [52, 50, 96], [92, 72, 120], [22, 24, 52], [40, 38, 78], [70, 56, 98], [255, 146, 88], [244, 104, 72], 0, 0.95, 0.8, [74, 72, 112], [120, 110, 160], [20, 20, 36], [74, 70, 110], [100, 96, 140], [150, 150, 186], [190, 190, 220], [70, 66, 110], [48, 46, 74], [66, 62, 96], [110, 110, 146], [150, 150, 186], [16, 14, 30], [40, 44, 54], [32, 36, 46], [28, 32, 38], [22, 26, 32], [70, 76, 120], [34, 38, 64], [220, 220, 240], [24, 24, 34], [16, 16, 24], [20, 16, 50], 200], "dawn": [[168, 176, 210], [236, 196, 200], [250, 196, 168], [150, 156, 196], [210, 170, 186], [230, 170, 150], [255, 196, 150], [255, 220, 190], 1, 0.25, 0.1, [240, 214, 220], [255, 184, 170], [80, 70, 90], [160, 150, 180], [226, 180, 186], [226, 222, 236], [255, 236, 232], [236, 206, 210], [100, 94, 110], [150, 120, 120], [196, 192, 206], [250, 230, 224], [40, 34, 44], [92, 104, 84], [74, 88, 66], [60, 74, 50], [46, 60, 40], [176, 190, 210], [96, 120, 140], [255, 230, 220], [40, 42, 34], [28, 32, 24], [90, 60, 100], 70], "day": [[150, 196, 232], [190, 222, 240], [236, 236, 222], [130, 176, 220], [170, 204, 230], [220, 220, 210], [255, 244, 214], [255, 250, 230], 1, 0, 0, [255, 255, 252], [236, 240, 246], [60, 60, 70], [140, 160, 190], [176, 194, 214], [236, 242, 250], [255, 255, 255], [210, 226, 236], [90, 100, 104], [128, 132, 120], [210, 216, 224], [250, 252, 255], [40, 40, 36], [104, 126, 70], [80, 106, 56], [70, 94, 44], [52, 76, 34], [120, 176, 196], [60, 120, 140], [255, 255, 250], [46, 50, 30], [32, 38, 22], [60, 80, 120], -240], "golden": [[236, 224, 204], [241, 204, 168], [234, 166, 138], [196, 180, 188], [204, 146, 146], [168, 92, 100], [248, 176, 140], [252, 206, 168], 1.0, 0.0, 0.0, [246, 222, 204], [236, 146, 126], [92, 62, 58], [182, 138, 142], [228, 162, 140], [222, 204, 210], [253, 232, 218], [238, 190, 166], [112, 86, 74], [166, 112, 86], [186, 170, 172], [246, 222, 206], [48, 32, 26], [104, 110, 64], [86, 96, 52], [70, 80, 42], [56, 66, 34], [146, 184, 170], [78, 128, 118], [252, 222, 196], [46, 46, 28], [32, 36, 22], [120, 50, 70], 0], "sunset": [[58, 44, 86], [172, 78, 94], [240, 132, 86], [40, 30, 68], [118, 54, 86], [198, 88, 74], [255, 146, 88], [244, 104, 72], 1.0, 0.0, 0.08, [198, 104, 118], [255, 168, 116], [44, 20, 32], [116, 66, 94], [214, 112, 98], [190, 142, 162], [255, 176, 140], [206, 104, 94], [66, 38, 58], [126, 64, 70], [146, 112, 134], [226, 146, 128], [24, 10, 18], [52, 44, 44], [40, 34, 34], [44, 36, 36], [34, 28, 28], [196, 104, 104], [66, 42, 68], [255, 196, 146], [38, 26, 32], [30, 20, 26], [60, 24, 60], 80]};

// [hour, palette]; the day wraps from 24 back to 0
const STOPS: [number, string][] = [
  [0, "night"],
  [4.75, "night"],
  [6.25, "dawn"],
  [8.5, "day"],
  [15.75, "day"],
  [17.5, "golden"],
  [19, "sunset"],
  [21, "night"],
  [24, "night"],
];

function sky(this: void, K: string[], P: Record<string, (number | number[])[]>, S: [number, string][], hour?: number) {
  let h = hour;
  if (h == null) {
    const q = /[?&]hour=([0-9.]+)/.exec(location.search);
    const d = new Date();
    h = q ? parseFloat(q[1]) : d.getHours() + d.getMinutes() / 60;
  }
  h = ((h % 24) + 24) % 24;
  let i = 0;
  while (i < S.length - 2 && S[i + 1][0] <= h) i++;
  const a = S[i];
  const b = S[i + 1];
  let t = b[0] > a[0] ? (h - a[0]) / (b[0] - a[0]) : 0;
  t = t * t * (3 - 2 * t);
  const A = P[a[1]];
  const B = P[b[1]];
  const st = document.documentElement.style;
  for (let k = 0; k < K.length; k++) {
    const x = A[k];
    const y = B[k];
    const v =
      typeof x === "number"
        ? +(x + ((y as number) - x) * t).toFixed(3) + (K[k] === "sun-y" ? "px" : "")
        : x.map((c, j) => Math.round(c + ((y as number[])[j] - c) * t)).join(" ");
    st.setProperty("--" + K[k], String(v));
  }
  // Text drawn on the sky picks light or dark ink from the sky's brightness (never a
  // mid-grey blend), so headings stay readable at every hour in either theme.
  const lin = (v: number) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
  const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const rgb = (n: string) => st.getPropertyValue("--" + n).trim().split(" ").map(Number);
  const ratio = (x: number, y: number) => (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  const LIGHT_INK = [246, 240, 226];
  const DARK_INK = [36, 30, 22];
  const skies = [lum(rgb("sky-top")), lum(rgb("sky-mid"))];
  const worst = (ink: number[]) => Math.min(...skies.map((s) => ratio(lum(ink), s)));
  const light = worst(LIGHT_INK) > worst(DARK_INK);
  st.setProperty("--on-sky", (light ? LIGHT_INK : DARK_INK).join(" "));
  st.setProperty("--on-sky-halo", light ? "20 16 30" : "250 244 230");
  // a split sky (dark top, bright horizon) gets a stronger glow behind the text
  st.setProperty("--on-sky-halo-a", Math.max(worst(LIGHT_INK), worst(DARK_INK)) < 4.5 ? "0.95" : "0.55");
  document.documentElement.dataset.sky = (t < 0.5 ? a : b)[1];
}

/** Inline script for <head>: defines window.__sky and paints the sky once. */
export const SKY_JS = `(function(){try{var f=${sky.toString()};var K=${JSON.stringify(KEYS)},P=${JSON.stringify(PALETTES)},S=${JSON.stringify(STOPS)};window.__sky=function(h){f(K,P,S,h)};window.__sky()}catch(e){}})();`;
