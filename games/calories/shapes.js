// Magnifoodle food silhouettes.
//
// Each shape is a list of parts drawn in a 100 x 100 box: { d: SVG path, fill, rule? }.
// Shapes don't need to fill the box. game.js measures each shape's real filled area
// and bounding box at load time, so area-equals-calories stays fair for thin shapes
// (banana) and chunky ones (orange) alike. rule: "evenodd" cuts holes (donut, bagel).
//
// To add a food: add an entry keyed by the food's exact `name` from foods.js.
// Foods without a shape fall back to a circle.

const P = {
  circle: (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`,
  ellipse: (cx, cy, rx, ry) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`,
  rect: (x, y, w, h, r = 0) => r
    ? `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`
    : `M${x} ${y}h${w}v${h}h${-w}Z`,
  almond: (cx, cy, rx, ry) => `M${cx - rx} ${cy}Q${cx} ${cy - 2 * ry} ${cx + rx} ${cy}Q${cx} ${cy + 2 * ry} ${cx - rx} ${cy}Z`,
};

function bowl(bowlColor, foodColor, mound = "M12 62 Q50 22 88 62 Z") {
  return [
    { d: mound, fill: foodColor },
    { d: "M6 60 L94 60 Q90 100 50 100 Q10 100 6 60 Z", fill: bowlColor },
  ];
}

function can(body, band, bandText) {
  return [
    { d: P.rect(28, 4, 44, 8, 3), fill: "#c4c7cc" },
    { d: P.rect(26, 10, 48, 90, 6), fill: body },
    { d: P.rect(26, 42, 48, 22), fill: band },
    { d: "M26 58 Q50 44 74 56 L74 62 Q50 50 26 64 Z", fill: bandText },
  ];
}

const SHAPES = {
  // ---------- fast food & branded ----------
  "Big Mac": [
    { d: "M10 46 Q10 6 50 6 Q90 6 90 46 Z", fill: "#d9913f" },
    ...[[30, 18], [46, 13], [62, 17], [38, 28], [56, 27], [72, 30], [24, 33]].map(([x, y]) =>
      ({ d: P.ellipse(x, y, 2.6, 1.4), fill: "#f6e7c1" })),
    { d: P.rect(6, 44, 88, 6, 3), fill: "#6db33f" },
    { d: P.rect(8, 49, 84, 10, 4), fill: "#5a3320" },
    { d: P.rect(12, 58, 76, 9, 3), fill: "#e0a04f" },
    { d: "M8 66 L92 66 L86 74 L50 70 L14 74 Z", fill: "#f4b400" },
    { d: P.rect(8, 70, 84, 10, 4), fill: "#5a3320" },
    { d: P.rect(10, 79, 80, 21, 8), fill: "#c47e35" },
  ],
  "McDonald's fries": [
    ...[[26, 18, 44], [35, 8, 50], [44, 14, 46], [53, 4, 54], [62, 12, 48], [71, 20, 40]].map(([x, y, h]) =>
      ({ d: P.rect(x, y, 8, h, 2), fill: "#f2c230" })),
    { d: "M18 42 L82 42 L72 100 L28 100 Z", fill: "#da291c" },
    { d: "M40 66 Q44 54 48 66 Q52 54 56 66 L54 66 Q52 60 50 66 L46 66 Q44 60 42 66 Z", fill: "#ffc72c" },
  ],
  "Glazed donut": [
    { d: P.ellipse(50, 70, 47, 29) + P.ellipse(50, 64, 13, 7), fill: "#c98a45", rule: "evenodd" },
    { d: P.ellipse(50, 64, 42, 22) + P.ellipse(50, 64, 15, 8.5), fill: "#ecc98f", rule: "evenodd" },
  ],
  "Snickers bar": [
    { d: P.rect(2, 74, 96, 26, 4), fill: "#5b3418" },
    { d: "M2 78 L0 74 L4 70 L2 66 L6 74 Z M98 78 L100 74 L96 70 L98 66 L94 74 Z", fill: "#5b3418" },
    { d: P.rect(22, 80, 56, 14, 3), fill: "#f3f1ec" },
    { d: P.rect(28, 84, 44, 6, 2), fill: "#1d4e9e" },
  ],
  "Coca-Cola": can("#e41e2b", "#e41e2b", "#ffffff"),
  "Caffè latte": [
    { d: P.rect(16, 8, 68, 12, 4), fill: "#f6f3ec" },
    { d: "M20 18 L80 18 L72 100 L28 100 Z", fill: "#f6f3ec" },
    { d: "M23 44 L77 44 L75 70 L25 70 Z", fill: "#b5865a" },
    { d: P.circle(50, 57, 9), fill: "#00704a" },
  ],

  // ---------- grains & bakery ----------
  "Costco pizza": [
    { d: "M50 6 L93 90 L7 90 Z", fill: "#f6c445" },
    ...[[44, 46, 5], [58, 64, 6], [36, 72, 5], [62, 80, 4], [50, 30, 3]].map(([x, y, r]) =>
      ({ d: P.ellipse(x, y, r, r * 0.7), fill: "#fbe08a" })),
    { d: P.rect(3, 86, 94, 14, 7), fill: "#c88a3f" },
  ],
  "Plain bagel": [
    { d: P.ellipse(50, 70, 47, 29) + P.ellipse(50, 64, 11, 6), fill: "#b8763a", rule: "evenodd" },
    { d: P.ellipse(50, 63, 40, 19) + P.ellipse(50, 64, 14, 8), fill: "#d39a57", rule: "evenodd" },
  ],
  "Croissant": [
    // Puffy segments that shrink and curl toward the tips; the centre is drawn last, on top.
    ...[[8, 84, 6, 7], [92, 84, 6, 7], [19, 77, 10, 13], [81, 77, 10, 13], [33, 69, 13, 18], [67, 69, 13, 18]]
      .map(([x, y, rx, ry], i) => ({ d: P.ellipse(x, y, rx, ry), fill: i % 4 < 2 ? "#c47a26" : "#d48f37" })),
    { d: P.ellipse(50, 63, 16, 23), fill: "#dd9a44" },
  ],
  "White rice": bowl("#dce8f2", "#fbfaf4"),
  "Spaghetti": [
    ...bowl("#f2efe9", "#f0cf6d"),
    { d: P.circle(50, 38, 9), fill: "#c8402f" },
  ],
  "White bread": [
    { d: "M14 100 L14 42 Q2 36 6 22 Q14 4 50 4 Q86 4 94 22 Q98 36 86 42 L86 100 Z", fill: "#c8843c" },
    { d: "M20 96 L20 40 Q10 35 13 25 Q20 10 50 10 Q80 10 87 25 Q90 35 80 40 L80 96 Z", fill: "#f6ecd6" },
  ],

  // ---------- fruit & veg ----------
  "Banana": [
    { d: "M10 28 Q14 90 88 86 L94 80 Q34 78 22 24 Z", fill: "#f4d03f" },
    { d: "M8 30 L10 20 L22 22 L22 28 Z", fill: "#6b4f1d" },
    { d: "M88 86 L96 86 L96 79 L92 78 Z", fill: "#3e2d12" },
  ],
  "Apple": [
    { d: P.rect(48, 10, 4, 20, 2), fill: "#6b4f1d" },
    { d: "M53 22 Q66 6 80 12 Q68 26 53 22 Z", fill: "#5fa83c" },
    { d: "M50 30 C20 14 0 40 7 66 C14 94 36 102 50 93 C64 102 86 94 93 66 C100 40 80 14 50 30 Z", fill: "#d63a2b" },
  ],
  "Orange": [
    { d: P.circle(50, 56, 43), fill: "#f39c12" },
    { d: "M50 13 Q58 2 70 6 Q62 16 50 13 Z", fill: "#4caf50" },
  ],
  "Avocado": [
    { d: "M50 3 C31 3 27 30 22 50 C13 76 26 100 50 100 C74 100 87 76 78 50 C73 30 69 3 50 3 Z", fill: "#3b5a1c" },
    { d: P.rect(48, 0, 4, 6, 2), fill: "#5a3d1c" },
  ],
  "Grapes": [
    { d: "M48 2 L52 2 L54 14 L46 14 Z", fill: "#6b4f1d" },
    ...[[20, 22], [40, 22], [60, 22], [80, 22], [30, 40], [50, 40], [70, 40], [40, 58], [60, 58], [50, 76]].map(([x, y]) =>
      ({ d: P.circle(x, y, 11), fill: "#9bc53d" })),
  ],
  "Strawberries": [
    { d: "M50 98 C20 82 6 52 14 30 C24 14 76 14 86 30 C94 52 80 82 50 98 Z", fill: "#e0303a" },
    ...[[34, 40], [50, 34], [66, 40], [40, 56], [60, 56], [50, 72], [30, 52], [70, 52]].map(([x, y]) =>
      ({ d: P.ellipse(x, y, 1.6, 2.4), fill: "#f9d36b" })),
    { d: "M26 24 L36 8 L46 20 L50 4 L54 20 L64 8 L74 24 Q50 32 26 24 Z", fill: "#3f9a3f" },
  ],
  "Baked potato": [
    { d: P.ellipse(50, 70, 47, 29), fill: "#9c6a3a" },
    { d: P.ellipse(50, 52, 22, 6), fill: "#f3dfa0" },
    { d: P.rect(44, 44, 12, 6, 2), fill: "#f7e27a" },
  ],
  "Broccoli": [
    { d: "M40 56 L60 56 L64 100 L36 100 Z", fill: "#8bc34a" },
    ...[[28, 38, 18], [50, 26, 21], [72, 38, 18], [38, 52, 15], [62, 52, 15]].map(([x, y, r]) =>
      ({ d: P.circle(x, y, r), fill: "#2f7d32" })),
  ],

  // ---------- protein & dairy ----------
  "Egg": [
    { d: "M50 4 C25 4 12 50 14 70 C16 92 32 100 50 100 C68 100 84 92 86 70 C88 50 75 4 50 4 Z", fill: "#f4e6cf" },
  ],
  "Chicken breast": [
    { d: "M8 72 C2 40 30 24 56 30 C82 36 99 52 93 76 C88 96 28 102 8 72 Z", fill: "#e2b072" },
    { d: "M26 52 L30 48 L72 76 L68 80 Z M38 44 L42 40 L82 64 L78 68 Z", fill: "#a86b33" },
  ],
  "Almonds": [[28, 88], [56, 90], [80, 86], [42, 76], [68, 76], [54, 64], [20, 76]].map(([x, y]) =>
    ({ d: P.almond(x, y, 14, 9), fill: "#a0622d" })),
  "Peanut butter": [
    { d: P.rect(24, 6, 52, 14, 3), fill: "#c62828" },
    { d: P.rect(18, 18, 64, 82, 10), fill: "#b8763a" },
    { d: P.rect(18, 44, 64, 30), fill: "#f5e6c4" },
    { d: P.ellipse(50, 59, 12, 8), fill: "#b8763a" },
  ],
  "Cheddar cheese": [
    { d: "M4 100 L4 62 L96 40 L96 100 Z", fill: "#f0a330" },
    { d: "M4 62 L62 22 L96 40 Z", fill: "#f8c463" },
    ...[[30, 80, 6], [64, 70, 5], [80, 88, 4]].map(([x, y, r]) => ({ d: P.circle(x, y, r), fill: "#d98a1c" })),
  ],
  "Whole milk": [
    { d: "M20 30 L35 6 L65 6 L80 30 Z", fill: "#e4e6ea" },
    { d: P.rect(44, 2, 12, 6, 1), fill: "#d0d3d8" },
    { d: P.rect(20, 30, 60, 70), fill: "#fafafa" },
    { d: P.rect(20, 52, 60, 22), fill: "#1e6fd9" },
  ],
  "Greek yogurt": [
    { d: P.rect(12, 30, 76, 10, 3), fill: "#3d8fd1" },
    { d: "M16 38 L84 38 L76 100 L24 100 Z", fill: "#fafafa" },
    { d: "M19 56 L81 56 L79 72 L21 72 Z", fill: "#3d8fd1" },
  ],

  // ---------- fats & drinks ----------
  "Butter": [
    { d: "M8 74 L26 60 L94 60 L76 74 Z", fill: "#fbe9a6" },
    { d: "M76 74 L94 60 L94 86 L76 100 Z", fill: "#e8c95c" },
    { d: P.rect(8, 74, 68, 26), fill: "#f5d76e" },
  ],
  "Olive oil": [
    { d: P.rect(40, 2, 20, 10, 2), fill: "#2f2f2f" },
    { d: P.rect(42, 10, 16, 26), fill: "#6b8e23" },
    { d: "M42 34 L58 34 L72 48 L72 100 L28 100 L28 48 Z", fill: "#6b8e23" },
    { d: P.rect(28, 58, 44, 26), fill: "#f3ecd2" },
    { d: P.ellipse(50, 71, 9, 6), fill: "#6b8e23" },
  ],
  "Beer": can("#c9a227", "#fdfaf0", "#c9a227"),
  "Red wine": [
    { d: "M24 6 L76 6 Q80 50 50 58 Q20 50 24 6 Z", fill: "#e9eef1" },
    { d: "M26 26 L74 26 Q75 50 50 56 Q25 50 26 26 Z", fill: "#7b1e2b" },
    { d: P.rect(48, 56, 4, 36), fill: "#dfe6ea" },
    { d: P.ellipse(50, 95, 22, 5), fill: "#dfe6ea" },
  ],
};
