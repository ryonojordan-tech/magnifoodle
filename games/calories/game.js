// Magnifoodle — daily calorie size-up game.
// The FILLED AREA of each food's silhouette is proportional to calories. The reference
// food is shown with its calories; the player resizes the target food to match.

(() => {
  const ROUNDS = 5;
  const LAUNCH_DATE = "2026-11-10";   // puzzle #1
  const BASE_AREA = 14000;            // preferred on-screen area of the reference (SVG units²)
  const SLIDER_SPAN = 1;              // slider covers 10^-1 .. 10^1 of the reference's calories
  const MIN_RATIO = 1 / 6, MAX_RATIO = 6;     // allowed target/reference calorie ratios
  const TOO_CLOSE = 1.25;                     // skip pairs that are nearly equal (start size = reference)
  const REF_X = 24, GAP = 56, GROUND_Y = 340;   // foods are left-aligned: x = left edge
  let TARGET_X = 360;                            // set per round, just right of the reference
  const MAX_H = 320, MAX_W_REF = 280, MAX_W_TARGET = 400;   // size limits so shapes stay on stage

  // ---------- shape measurement ----------
  // Rasterise each silhouette once to find its true filled area and bounding box
  // (in its 100x100 design box), so scaling by area is fair for every shape.
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
      const parts = (typeof SHAPES !== "undefined" && SHAPES[food.name]) ||
        [{ d: "M0 50a50 50 0 1 0 100 0a50 50 0 1 0 -100 0Z", fill: CATEGORY_COLORS[food.category] || "#999" }];
      shapeCache[food.name] = { parts, ...measure(parts) };
    }
    return shapeCache[food.name];
  }
  // Largest reference area that keeps both foods on stage, even at the slider's max.
  function refAreaFor(ref, target) {
    const r = shapeFor(ref), t = shapeFor(target);
    const maxRatio = Math.pow(10, SLIDER_SPAN);
    const fit = (s, w, ratio) => Math.min(
      s.area * (MAX_H / (s.maxY - s.minY)) ** 2,
      s.area * (w / (s.maxX - s.minX)) ** 2) / ratio;
    return Math.min(BASE_AREA, fit(r, MAX_W_REF, 1), fit(t, MAX_W_TARGET, maxRatio));
  }
  let refArea = BASE_AREA;

  // ---------- date + seeded random ----------
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

  // Pick 5 reference/target pairs for the day, with no food used twice.
  function buildRounds(seed) {
    const rng = mulberry32(seed);
    const pool = FOODS.map((f, i) => i);
    const used = new Set();
    const rounds = [];
    let guard = 0;
    while (rounds.length < ROUNDS && guard++ < 5000) {
      const a = pool[Math.floor(rng() * pool.length)];
      const b = pool[Math.floor(rng() * pool.length)];
      if (a === b || used.has(a) || used.has(b)) continue;
      const ratio = FOODS[b].kcal / FOODS[a].kcal;
      if (ratio < MIN_RATIO || ratio > MAX_RATIO) continue;
      if (ratio > 1 / TOO_CLOSE && ratio < TOO_CLOSE) continue;
      used.add(a); used.add(b);
      rounds.push({ ref: FOODS[a], target: FOODS[b] });
    }
    return rounds;
  }

  const rounds = buildRounds(hashString("magnifoodle:" + today));
  const storeKey = "magnifoodle-" + today;
  const saved = JSON.parse(localStorage.getItem(storeKey) || '{"results":[]}');
  let roundIdx = saved.results.length;
  let locked = false;

  // ---------- DOM ----------
  const $ = id => document.getElementById(id);
  const svgNS = "http://www.w3.org/2000/svg";
  const slider = $("sizeSlider");

  $("dateLabel").textContent = today;

  function el(tag, attrs, text) {
    const e = document.createElementNS(svgNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  // On-screen width/height of a food drawn with filled area = `area`.
  function sizeOf(food, area) {
    const s = shapeFor(food);
    const f = Math.sqrt(area / s.area);
    return { w: f * (s.maxX - s.minX), h: f * (s.maxY - s.minY) };
  }

  // Silhouette scaled so its filled area = `area`, left edge at x, bottom edge at baseY.
  function shapeGroup(food, area, x, solidFill, baseY = GROUND_Y) {
    const s = shapeFor(food);
    const f = Math.sqrt(area / s.area);
    const g = el("g", {
      transform: `translate(${x - f * s.minX} ${baseY - f * s.maxY}) scale(${f})`,
    });
    for (const p of s.parts) {
      g.appendChild(el("path", {
        d: p.d, fill: solidFill || p.fill, "fill-rule": p.rule || "nonzero",
        class: solidFill ? "" : "food-part",
      }));
    }
    return g;
  }

  function drawFood(group, food, area, x, showKcal, baseY = GROUND_Y) {
    group.innerHTML = "";
    group.appendChild(shapeGroup(food, area, x, null, baseY));
    group.appendChild(el("text", { x, y: baseY + 18, "text-anchor": "start", class: "food-name" },
      food.name + (showKcal ? ` — ${food.kcal} kcal` : "")));
    group.appendChild(el("text", { x, y: baseY + 34, "text-anchor": "start", class: "food-serving" },
      food.serving));
  }

  // slider value -> calorie ratio vs reference (log scale)
  const sliderRatio = () => Math.pow(10, (slider.value / 1000) * SLIDER_SPAN);

  // ---------- target position (draggable anywhere in the box) ----------
  const STAGE_W = 800;
  let tPos = { x: 0, base: GROUND_Y };   // target's left edge and bottom edge
  let refBox = null;                     // reference shape's box, for overlap checks

  // Keep the target fully inside the box. Its bottom never goes below the ground line,
  // which leaves room for its labels.
  function clampTarget(w, h) {
    tPos.x = Math.max(0, Math.min(tPos.x, STAGE_W - w));
    tPos.base = Math.min(GROUND_Y, Math.max(tPos.base, h));
  }

  function renderTarget() {
    const r = rounds[roundIdx];
    const area = refArea * sliderRatio();
    const { w, h } = sizeOf(r.target, area);
    clampTarget(w, h);
    drawFood($("targetGroup"), r.target, area, tPos.x, locked, tPos.base);
    const overlaps = refBox &&
      tPos.x < refBox.x + refBox.w && tPos.x + w > refBox.x &&
      tPos.base - h < refBox.y + refBox.h && tPos.base > refBox.y;
    $("targetGroup").classList.toggle("overlap", !!overlaps);   // see-through while on top of the reference
    if (locked) renderGhost();
  }

  // True size: a translucent blue silhouette laid over the player's guess. It follows the food.
  function renderGhost() {
    const r = rounds[roundIdx];
    $("ghostGroup").innerHTML = "";
    const ghost = shapeGroup(r.target, refArea * (r.target.kcal / r.ref.kcal), tPos.x, "#2563eb", tPos.base);
    ghost.setAttribute("class", "ghost");
    $("ghostGroup").appendChild(ghost);
  }

  function startRound() {
    locked = false;
    const r = rounds[roundIdx];
    updateProgress();
    $("totalScore").textContent = totalScore();
    $("prompt").innerHTML = `How big is <b>${r.target.name}</b> (${r.target.serving}) next to <b>${r.ref.name}</b>?`;
    slider.value = 0;
    slider.disabled = false;
    $("ghostGroup").innerHTML = "";
    refArea = refAreaFor(r.ref, r.target);
    // Measure the reference with its revealed label so the target never overlaps it later.
    drawFood($("refGroup"), r.ref, refArea, REF_X, true);
    TARGET_X = REF_X + $("refGroup").getBBox().width + GAP;
    drawFood($("refGroup"), r.ref, refArea, REF_X, false);   // calories hidden until lock-in
    const rs = sizeOf(r.ref, refArea);
    refBox = { x: REF_X, y: GROUND_Y - rs.h, w: rs.w, h: rs.h };
    tPos = { x: TARGET_X, base: GROUND_Y };
    renderTarget();
    $("controls").classList.remove("hidden");
    $("hint").classList.remove("hidden");
    $("lockBtn").classList.remove("hidden");
    $("result").classList.add("hidden");
  }

  function scoreFor(guessKcal, actualKcal) {
    const err = Math.abs(Math.log2(guessKcal / actualKcal));   // 1 = off by 2x
    if (err <= Math.log2(1.05)) return 100;                    // within 5% = perfect
    return Math.round(100 * Math.max(0, 1 - err / 2));         // 2x off = 50, 4x off = 0
  }

  function totalScore() {
    return saved.results.reduce((s, x) => s + x.score, 0);
  }

  // 5 bars: one fills each time a round is answered; the round in play is outlined.
  function updateProgress() {
    const done = saved.results.length;
    $("progress").querySelectorAll("i").forEach((bar, i) => {
      bar.className = i < done ? "filled" : (i === done ? "current" : "");
    });
    $("progress").setAttribute("aria-label",
      done >= ROUNDS ? `All ${ROUNDS} rounds done` : `Round ${done + 1} of ${ROUNDS}, ${done} answered`);
  }

  function lockIn() {
    if (locked) return;
    locked = true;
    const r = rounds[roundIdx];
    const guess = Math.round(r.ref.kcal * sliderRatio());
    const score = scoreFor(guess, r.target.kcal);
    saved.results.push({ guess, score });
    localStorage.setItem(storeKey, JSON.stringify(saved));

    slider.disabled = true;
    renderTarget();                                          // also draws the true-size shadow
    drawFood($("refGroup"), r.ref, refArea, REF_X, true);    // reveal reference calories

    const ratio = guess / r.target.kcal;
    const pct = Math.round((ratio - 1) * 100);
    const dir = pct === 0 ? "spot on"
      : ratio >= 2 ? `${ratio.toFixed(1)}× too big`
      : ratio <= 0.5 ? `${(1 / ratio).toFixed(1)}× too small`
      : `${Math.abs(pct)}% ${pct > 0 ? "too big" : "too small"}`;
    $("resultText").innerHTML =
      `<b>${r.target.name}</b> is <b>${r.target.kcal} kcal</b> and <b>${r.ref.name}</b> is <b>${r.ref.kcal} kcal</b>. ` +
      `You sized it at ~${guess} kcal (${dir}). ` +
      `<b>+${score}</b> points. <br><small>Blue shadow = true size.</small>`;
    $("totalScore").textContent = totalScore();
    updateProgress();
    $("lockBtn").classList.add("hidden");
    $("controls").classList.add("hidden");
    $("hint").classList.add("hidden");
    $("result").classList.remove("hidden");
    $("nextBtn").textContent = roundIdx + 1 < ROUNDS ? "Next round" : "See results";
  }

  function next() {
    roundIdx++;
    if (roundIdx >= ROUNDS) showSummary();
    else startRound();
  }

  const emojiFor = s => (s >= 85 ? "🟩" : s >= 50 ? "🟨" : "🟥");

  function showSummary() {
    $("game").classList.add("hidden");
    $("summary").classList.remove("hidden");
    updateProgress();
    $("totalScore").textContent = totalScore();
    $("finalScore").textContent = `${totalScore()} / ${ROUNDS * 100}`;
    const rows = rounds.map((r, i) => {
      const res = saved.results[i];
      return `<tr><td>${emojiFor(res.score)}</td><td>${r.target.name} vs ${r.ref.name}</td>` +
             `<td>${res.guess} → ${r.target.kcal} kcal</td><td>${res.score}</td></tr>`;
    });
    $("summaryTable").innerHTML =
      "<tr><th></th><th>Round</th><th>Guess → actual</th><th>Pts</th></tr>" + rows.join("");
  }

  // Link to the site's home page, only when served from a real web address
  // (not when the file is opened straight from disk).
  function siteLink() {
    if (!/^https?:$/.test(location.protocol)) return "";
    return new URL("../../", location.href).href;
  }

  function resultText() {
    const link = siteLink();
    return `Magnifoodle #${dayNumber} ${totalScore()}/${ROUNDS * 100}\n` +
      saved.results.map(r => emojiFor(r.score)).join("") +
      (link ? `\n${link}` : "");
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

  // Works on file:// pages too, where the async clipboard API isn't available.
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

  // Opens the device's share sheet (Messages, WhatsApp, etc.). Falls back to copying
  // where the share sheet isn't available (older browsers, or the file opened from disk).
  async function share() {
    const text = resultText();
    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share({ text });
        $("shareMsg").textContent = "";
      } catch (e) {
        if (e.name !== "AbortError") copyResult("Couldn't open sharing. ");   // AbortError = user closed the sheet
      }
    } else {
      copyResult("Sharing isn't available here. ");
    }
  }

  // ---------- input ----------
  // Drag the target food anywhere in the box (mouse, pen or touch). Works before and
  // after lock-in; after lock-in the true-size shadow moves with it.
  const stage = $("stage");
  let drag = null;
  function svgPoint(e) {
    const p = stage.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(stage.getScreenCTM().inverse());
  }
  $("targetGroup").addEventListener("pointerdown", e => {
    const p = svgPoint(e);
    drag = { dx: p.x - tPos.x, dy: p.y - tPos.base };
    $("targetGroup").setPointerCapture(e.pointerId);
    stage.classList.add("dragging");
    e.preventDefault();
  });
  $("targetGroup").addEventListener("pointermove", e => {
    if (!drag) return;
    const p = svgPoint(e);
    tPos.x = p.x - drag.dx;
    tPos.base = p.y - drag.dy;
    renderTarget();
  });
  const endDrag = () => { drag = null; stage.classList.remove("dragging"); };
  $("targetGroup").addEventListener("pointerup", endDrag);
  $("targetGroup").addEventListener("pointercancel", endDrag);

  function nudge(delta) {
    if (locked) return;
    slider.value = Math.max(-1000, Math.min(1000, Number(slider.value) + delta));
    renderTarget();
  }
  slider.addEventListener("input", renderTarget);
  $("smaller").addEventListener("click", () => nudge(-40));
  $("bigger").addEventListener("click", () => nudge(40));
  $("stage").addEventListener("wheel", e => { e.preventDefault(); nudge(e.deltaY < 0 ? 25 : -25); }, { passive: false });
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") { if (document.activeElement !== slider) nudge(25); }
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") { if (document.activeElement !== slider) nudge(-25); }
    else if (e.key === "Enter") {
      if (document.activeElement && document.activeElement.tagName === "BUTTON") return; // native click handles it
      if (!$("summary").classList.contains("hidden")) return;
      e.preventDefault();
      locked ? next() : lockIn();
    }
  });
  $("lockBtn").addEventListener("click", lockIn);
  $("nextBtn").addEventListener("click", next);
  $("shareBtn").addEventListener("click", share);
  $("copyBtn").addEventListener("click", () => copyResult());

  // ---------- start ----------
  if (roundIdx >= ROUNDS) showSummary();
  else startRound();
})();
