// Calorie Climb — daily higher/lower calorie streak game.
// Everyone gets the same food order each day (seeded by the date), with one attempt.
// The current (reference) food shows its calories; guess whether the next food is higher or lower.
// Foods are drawn with AREA proportional to calories on one shared scale, so sizes are
// comparable across the whole run. The next food is fully hidden behind a "?" until you guess.

(() => {
  const LAUNCH_DATE = "2026-11-10";        // climb #1
  const GROUND_Y = 330;
  const CUR_X = 40, NEXT_X = 430;          // left edges of the two foods
  const MAX_W = 340, MAX_H = 260;          // largest any food can be drawn
  const MYSTERY_H = 110, MYSTERY_W = 170;  // size of the grey "?" silhouette
  const REVEAL_MS = 1400;                  // pause on a correct reveal before moving on

  // ---------- date + seeded random (same approach as Calorie Size-Up) ----------
  const params = new URLSearchParams(location.search);
  const today = params.get("date") || localDateString(new Date());   // ?date=YYYY-MM-DD for testing
  const dayNumber = Math.round((Date.parse(today) - Date.parse(LAUNCH_DATE)) / 86400000) + 1;

  function localDateString(d) {
    const p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function hashString(s) {
    let h = 2166136261;
    for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Shuffle every food into today's order, with no two equal-calorie foods back to back.
  function buildSequence(seed) {
    const rng = mulberry32(seed);
    const seq = FOODS.map((_, i) => i);
    for (let i = seq.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [seq[i], seq[j]] = [seq[j], seq[i]];
    }
    const kcal = i => FOODS[seq[i]].kcal;
    for (let pass = 0; pass < 10; pass++) {
      let fixed = true;
      for (let i = 1; i < seq.length; i++) {
        if (kcal(i) !== kcal(i - 1)) continue;
        fixed = false;
        const j = seq.findIndex((_, k) => k > i && kcal(k) !== kcal(i - 1) &&
          (k + 1 >= seq.length || FOODS[seq[i]].kcal !== kcal(k + 1)) && kcal(k - 1) !== FOODS[seq[i]].kcal);
        if (j > 0) [seq[i], seq[j]] = [seq[j], seq[i]];
      }
      if (fixed) break;
    }
    // Safety net: drop anything still tied with the food before it.
    return seq.filter((f, i, a) => i === 0 || FOODS[f].kcal !== FOODS[a[i - 1]].kcal);
  }

  const seq = buildSequence(hashString("calorie-climb:" + today));
  const storeKey = "climb-" + today;
  const BEST_KEY = "climb-best";
  // pos = index in seq of the current food; results = one entry per guess
  const saved = JSON.parse(localStorage.getItem(storeKey) || '{"pos":0,"results":[],"over":false}');
  const save = () => localStorage.setItem(storeKey, JSON.stringify(saved));
  const streak = () => saved.results.filter(r => r.ok).length;
  const best = () => Number(localStorage.getItem(BEST_KEY) || 0);
  let busy = false;

  // ---------- shapes: measure once, then one shared calories-to-area scale ----------
  const shapeCache = {};
  function measure(parts) {
    const N = 200, k = N / 100;
    const c = document.createElement("canvas");
    c.width = c.height = N;
    const ctx = c.getContext("2d");
    ctx.scale(k, k);
    for (const p of parts) ctx.fill(new Path2D(p.d), p.rule || "nonzero");
    const px = ctx.getImageData(0, 0, N, N).data;
    let count = 0, minX = N, maxX = -1, minY = N, maxY = -1;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (px[(y * N + x) * 4 + 3] > 127) {
        count++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    return { area: count / (k * k), minX: minX / k, maxX: (maxX + 1) / k, minY: minY / k, maxY: (maxY + 1) / k };
  }
  function shapeFor(food) {
    if (!shapeCache[food.name]) {
      const parts = SHAPES[food.name] || [{ d: "M0 50a50 50 0 1 0 100 0a50 50 0 1 0 -100 0Z", fill: "#c9c1b6" }];
      const m = measure(parts);
      shapeCache[food.name] = { parts, ...m, w: m.maxX - m.minX, h: m.maxY - m.minY };
    }
    return shapeCache[food.name];
  }
  // K = screen area per calorie, the largest value that lets every food fit on stage.
  const K = Math.min(...FOODS.map(f => {
    const s = shapeFor(f);
    return s.area * Math.min((MAX_W / s.w) ** 2, (MAX_H / s.h) ** 2) / f.kcal;
  }));
  const trueScale = food => Math.sqrt(food.kcal * K / shapeFor(food).area);
  const mysteryScale = food => { const s = shapeFor(food); return Math.min(MYSTERY_H / s.h, MYSTERY_W / s.w); };

  // ---------- drawing ----------
  const $ = id => document.getElementById(id);
  const svgNS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    const e = document.createElementNS(svgNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  // CSS transform (so it can animate) placing the shape's left edge at x, bottom on the ground.
  function placement(food, x, f) {
    const s = shapeFor(food);
    return `translate(${x - f * s.minX}px, ${GROUND_Y - f * s.maxY}px) scale(${f})`;
  }
  function shapeG(food, x, f, grey) {
    const g = el("g", { class: "grow" });
    g.style.transform = placement(food, x, f);
    for (const p of shapeFor(food).parts) {
      g.appendChild(el("path", {
        d: p.d, fill: grey ? "#cfc8bd" : p.fill, "fill-rule": p.rule || "nonzero",
        class: grey ? "" : "food-part",
      }));
    }
    return g;
  }
  function labels(group, food, x, top, showKcal) {
    if (showKcal) group.appendChild(el("text", { x, y: top - 10, class: "food-kcal-big" }, `${food.kcal} kcal`));
    group.appendChild(el("text", { x, y: GROUND_Y + 20, class: "food-name" }, food.name));
    group.appendChild(el("text", { x, y: GROUND_Y + 38, class: "food-serving" }, food.serving));
  }
  function drawRevealed(group, food, x) {
    group.innerHTML = "";
    const f = trueScale(food);
    group.appendChild(shapeG(food, x, f, false));
    labels(group, food, x, GROUND_Y - f * shapeFor(food).h, true);
  }
  // Before a guess the next food is completely hidden: no picture, name or serving,
  // just a big "?". The guess is based on the reference food alone.
  function drawMystery(group, x) {
    group.innerHTML = "";
    group.appendChild(el("text", { x: x + MAX_W / 2, y: GROUND_Y - 40, "text-anchor": "middle", class: "mystery-q" }, "?"));
  }
  // Mystery silhouette -> full colour, animating from mystery size to true calorie size.
  function reveal(group, food, x) {
    group.innerHTML = "";
    const g = shapeG(food, x, mysteryScale(food), false);
    group.appendChild(g);
    g.getBoundingClientRect();                       // commit the start size before animating
    const f = trueScale(food);
    g.style.transform = placement(food, x, f);
    labels(group, food, x, GROUND_Y - f * shapeFor(food).h, true);
  }

  function setFeedback(text, cls) {
    $("feedback").textContent = text;
    $("feedback").setAttribute("class", "feedback " + (cls || ""));
  }
  function updateMeta() {
    $("streak").textContent = streak();
    $("best").textContent = Math.max(best(), streak());
  }

  function render() {
    const cur = FOODS[seq[saved.pos]], next = FOODS[seq[saved.pos + 1]];
    drawRevealed($("curGroup"), cur, CUR_X);
    drawMystery($("nextGroup"), NEXT_X);
    setFeedback("");
    $("prompt").innerHTML = `Is the next food higher or lower than <b>${cur.name}</b> (${cur.kcal} kcal)?`;
    $("lowerBtn").disabled = $("higherBtn").disabled = false;
    updateMeta();
  }

  // ---------- guessing ----------
  function guess(dir) {
    if (busy || saved.over) return;
    busy = true;
    $("lowerBtn").disabled = $("higherBtn").disabled = true;
    const cur = FOODS[seq[saved.pos]], next = FOODS[seq[saved.pos + 1]];
    const ok = dir === "higher" ? next.kcal > cur.kcal : next.kcal < cur.kcal;
    saved.results.push({ dir, ok });
    reveal($("nextGroup"), next, NEXT_X);

    if (ok) {
      saved.pos++;
      if (saved.pos >= seq.length - 1) saved.over = true;   // climbed every food
      setFeedback(`✓ ${dir === "higher" ? "Higher" : "Lower"}!`, "right");
    } else {
      saved.over = true;
      setFeedback(`✗ It was ${dir === "higher" ? "lower" : "higher"}`, "wrong");
    }
    if (saved.over && streak() > best()) localStorage.setItem(BEST_KEY, String(streak()));
    save();
    updateMeta();
    setTimeout(() => {
      busy = false;
      if (saved.over) showSummary();
      else render();
    }, ok ? REVEAL_MS : REVEAL_MS + 900);
  }

  // ---------- end of run ----------
  function showSummary() {
    $("game").classList.add("hidden");
    $("summary").classList.remove("hidden");
    updateMeta();
    const perfect = saved.results.length > 0 && saved.results.every(r => r.ok);
    $("summaryTitle").textContent = perfect ? "You climbed every food!" : "Run over";
    $("finalStreak").textContent = `🔥 ${streak()}`;
    $("bestLine").textContent = `Best streak: ${Math.max(best(), streak())}`;
    // Recap: the starting food, then each guess with the food it revealed.
    const rows = [`<tr><th>#</th><th>Food</th><th class="num">kcal</th><th>Your guess</th></tr>`,
      `<tr><td>1</td><td>${FOODS[seq[0]].name}</td><td class="num">${FOODS[seq[0]].kcal}</td><td>start</td></tr>`];
    saved.results.forEach((r, i) => {
      const f = FOODS[seq[i + 1]];
      rows.push(`<tr><td>${i + 2}</td><td>${f.name}</td><td class="num">${f.kcal}</td>` +
        `<td>${r.dir === "higher" ? "▲ Higher" : "▼ Lower"} ${r.ok ? "✅" : "❌"}</td></tr>`);
    });
    $("recap").innerHTML = rows.join("");
  }

  // ---------- sharing (same behaviour as Calorie Size-Up) ----------
  function siteLink() {
    if (!/^https?:$/.test(location.protocol)) return "";
    return new URL("../../", location.href).href;
  }
  function resultText() {
    const n = streak(), lost = saved.results.some(r => !r.ok);
    const squares = "🟩".repeat(Math.min(n, 15)) + (n > 15 ? `+${n - 15}` : "") + (lost ? "🟥" : "🏆");
    const link = siteLink();
    return `Calorie Climb #${dayNumber} 🔥 ${n}\n${squares}` + (link ? `\n${link}` : "");
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    done(ok ? "Copied to clipboard!" : "Copy this: " + text);
  }
  function copyResult(prefix = "") {
    const text = resultText();
    const done = msg => ($("shareMsg").textContent = prefix + msg);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => done("Copied to clipboard!"), () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  async function share() {
    const text = resultText();
    if (navigator.share && window.isSecureContext) {
      try { await navigator.share({ text }); $("shareMsg").textContent = ""; }
      catch (e) { if (e.name !== "AbortError") copyResult("Couldn't open sharing. "); }
    } else {
      copyResult("Sharing isn't available here. ");
    }
  }

  // ---------- input + start ----------
  $("higherBtn").addEventListener("click", () => guess("higher"));
  $("lowerBtn").addEventListener("click", () => guess("lower"));
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { e.preventDefault(); guess("higher"); }
    else if (e.key === "ArrowDown") { e.preventDefault(); guess("lower"); }
  });
  $("shareBtn").addEventListener("click", share);
  $("copyBtn").addEventListener("click", () => copyResult());

  $("dateLabel").textContent = today;
  if (saved.over) showSummary();
  else render();
})();
