/* Lumencraft — home page effects */
(() => {
  "use strict";
  const { $, $$, LOW, REDUCED } = window.LC;
  const DESK = !LOW;

  /* ---------- preloader ---------- */
  const pre = $("#preloader");
  const reveal = () => window.dispatchEvent(new CustomEvent("lc:reveal"));
  if (pre) {
    const T = LOW ? 800 : 4400; let exited = false, ready = false, boom = false, raf;
    const cv = $(".pl-particles", pre), ctx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, ps = [], mx = -1e4, my = -1e4;
    const cols = ["rgba(255,255,255,", "rgba(168,143,255,", "rgba(86,97,255,", "rgba(255,0,109,"];
    const size = () => { W = pre.clientWidth; H = pre.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const seed = () => { const n = Math.round(Math.min(130, Math.max(56, W * H / 14000))); ps = Array.from({ length: n }, () => { const c = Math.random() < .66 ? 0 : Math.random() < .5 ? 1 : Math.random() < .7 ? 2 : 3; return { x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 1.6, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, a: .22 + Math.random() * .5, tw: Math.random() * 6.28, c: cols[c] }; }); };
    const frame = () => { ctx.clearRect(0, 0, W, H); const cx = W / 2, cy = H / 2;
      if (!boom) for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { const a = ps[i], b = ps[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy; if (d < 12100) { ctx.strokeStyle = `rgba(134,120,255,${(.1 * (1 - d / 12100)).toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
      for (const p of ps) {
        if (boom) { const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1; p.vx += dx / d * .85; p.vy += dy / d * .85; p.a *= .938; }
        else { p.tw += .03; const dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy; if (d < 15000) { const l = Math.sqrt(d) || 1, f = (1 - d / 15000) * .7; p.vx += dx / l * f; p.vy += dy / l * f; } p.vx *= .965; p.vy *= .965; if (p.x < 0) p.x += W; if (p.x > W) p.x -= W; if (p.y < 0) p.y += H; if (p.y > H) p.y -= H; }
        p.x += p.vx; p.y += p.vy; const al = boom ? p.a : p.a * (.6 + .4 * Math.sin(p.tw)); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = p.c + al.toFixed(3) + ")"; ctx.fill(); }
      raf = requestAnimationFrame(frame); };
    if (!LOW) { size(); seed(); frame(); addEventListener("resize", () => { size(); seed(); }); }
    const exit = () => { if (exited) return; exited = true; reveal(); if (!LOW) { boom = true; pre.classList.add("pl-boom"); } pre.classList.add("pl-done"); setTimeout(() => { cancelAnimationFrame(raf); pre.remove(); }, 1200); };
    pre.addEventListener("pointermove", (e) => { const r = pre.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    pre.addEventListener("pointerleave", () => { mx = my = -1e4; });
    pre.addEventListener("pointerdown", () => ready && exit());
    addEventListener("keydown", (e) => { if (ready && (e.key === "Enter" || e.key === " ")) exit(); });
    setTimeout(() => { ready = true; pre.classList.add("pl-ready"); }, LOW ? 300 : 2500);
    setTimeout(reveal, Math.max(0, T - 2900));
    setTimeout(exit, T); setTimeout(exit, 10000);
  }

  /* ---------- hero entrance ---------- */
  const hero = $(".hero");
  if (hero) {
    let done = false; const go = () => { if (done) return; done = true; hero.classList.remove("hero-anim"); hero.classList.add("hero-in"); };
    if (!pre || LOW) requestAnimationFrame(go); else { addEventListener("lc:reveal", go, { once: true }); setTimeout(go, 7000); }

    /* orbs mouse parallax */
    const orbs = $$(".hero-orb", hero);
    if (DESK) { const X = [42, -52, 34], Y = [30, 42, -34]; let tx = 0, ty = 0, x = 0, y = 0;
      hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1; });
      const lp = () => { x += (tx - x) * .06; y += (ty - y) * .06; orbs.forEach((o, i) => (o.style.transform = `translate(${(x * X[i]).toFixed(1)}px,${(y * Y[i]).toFixed(1)}px)`)); requestAnimationFrame(lp); }; lp(); }

    /* dot globe */
    const gc = $(".hero-globe", hero);
    if (gc && DESK) {
      const ctx = gc.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2); let W, H;
      const LAND = [[60,-120,12,34],[48,-100,10,22],[38,-95,10,18],[30,-100,7,10],[20,-100,6,8],[63,-150,7,12],[70,-92,6,25],[55,-70,8,10],[45,-75,6,8],[72,-40,8,14],[12,-85,5,6],[0,-68,12,12],[-15,-55,14,12],[-30,-62,10,7],[-45,-69,8,4],[52,15,8,18],[60,28,8,14],[45,5,5,8],[40,-4,4,5],[64,15,6,8],[15,0,9,20],[10,20,10,14],[-5,22,12,10],[-22,25,9,9],[5,38,8,8],[28,45,8,10],[60,90,12,50],[45,90,10,30],[30,80,8,12],[22,78,8,6],[35,105,10,15],[25,110,6,10],[50,130,8,12],[15,102,6,6],[0,113,5,10],[36,138,5,4],[-25,135,9,16],[-40,175,4,3],[-18,47,5,3],[8,125,4,4]];
      const isLand = (la, lo) => LAND.some(([a, b, r1, r2]) => { let d = lo - b; if (d > 180) d -= 360; if (d < -180) d += 360; return ((la - a) / r1) ** 2 + (d / r2) ** 2 <= 1; });
      const dots = [];
      for (let i = 1; i <= 57; i++) { const la = i / 58 * 180 - 90; for (let j = 0; j < 116; j++) { const lo = j / 116 * 360 - 180; const L = la * Math.PI / 180, O = lo * Math.PI / 180; dots.push([Math.cos(L) * Math.cos(O), Math.sin(L), Math.cos(L) * Math.sin(O), isLand(la, lo)]); } }
      const landDots = dots.filter((d) => d[3]);
      const arcs = []; while (arcs.length < 11) { const a = landDots[Math.random() * landDots.length | 0], b = landDots[Math.random() * landDots.length | 0]; if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) > 1.15) arcs.push({ a, b, ph: Math.random(), c: ["86,97,255", "177,75,255", "255,0,109"][arcs.length % 3] }); }
      let g = Math.random() * 6.28; const tl = -.34, ct = Math.cos(tl), st = Math.sin(tl);
      const size = () => { W = gc.clientWidth; H = gc.clientHeight; gc.width = W * dpr; gc.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }; size(); addEventListener("resize", size);
      const P = (p, R, cx, cy, ang = g) => { const c = Math.cos(ang), s = Math.sin(ang); const x = p[0] * c - p[2] * s, z = p[0] * s + p[2] * c, y = p[1]; const y2 = y * ct - z * st, z2 = y * st + z * ct; return [cx + x * R, cy - y2 * R, z2]; };
      const mid = (a, b, t) => { const m = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; const l = Math.hypot(...m) || 1, k = 1 + .4 * Math.sin(Math.PI * t); return [m[0] / l * k, m[1] / l * k, m[2] / l * k]; };
      const draw = (now) => {
        ctx.clearRect(0, 0, W, H); const R = Math.min(.46 * W, 760), cx = W / 2, cy = .46 * H; if (!REDUCED) g += .0015;
        for (let e = 0; e < 3; e++) { const tx = .45 + .4 * e, sp = g * (.7 + .15 * e) + 1.1 * e; ctx.beginPath(); let started = false;
          for (let k = 0; k <= 96; k++) { const a = k / 96 * 6.283; let x = Math.cos(a) * 1.06, y = 0, z = Math.sin(a) * 1.06; const y1 = y * Math.cos(tx) - z * Math.sin(tx), z1 = y * Math.sin(tx) + z * Math.cos(tx); const q = P([x, y1, z1], R, cx, cy, sp); if (q[2] >= -.04) { started ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); started = true; } else started = false; }
          ctx.strokeStyle = "rgba(255,255,255,.04)"; ctx.lineWidth = 1; ctx.stroke(); }
        for (const d of dots) { const q = P(d, R, cx, cy); if (q[2] < -.12) continue; const k = (q[2] + 1) / 2; ctx.beginPath(); if (d[3]) { ctx.arc(q[0], q[1], .8 + .9 * k, 0, 6.283); ctx.fillStyle = `rgba(255,255,255,${(.07 + .24 * k).toFixed(3)})`; } else { ctx.arc(q[0], q[1], .5 + .35 * k, 0, 6.283); ctx.fillStyle = `rgba(255,255,255,${(.012 + .03 * k).toFixed(3)})`; } ctx.fill(); }
        for (const A of arcs) { const pa = P(A.a, R, cx, cy), pb = P(A.b, R, cx, cy); if (pa[2] < -.25 && pb[2] < -.25) continue;
          ctx.beginPath(); for (let t = 0; t <= 1.001; t += .05) { const q = P(mid(A.a, A.b, t), R, cx, cy); t ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.strokeStyle = "rgba(255,255,255,.04)"; ctx.stroke();
          const p = (now / 4200 + A.ph) % 1;
          for (let n = 4; n >= 0; n--) { const tt = p - n * .04; if (tt < 0) continue; const q = P(mid(A.a, A.b, tt), R, cx, cy); if (q[2] < -.2) continue;
            if (!n) { const gr = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 13); gr.addColorStop(0, `rgba(${A.c},.3)`); gr.addColorStop(1, `rgba(${A.c},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(q[0], q[1], 13, 0, 6.283); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(q[0], q[1], 1.9, 0, 6.283); ctx.fill(); }
            else { ctx.fillStyle = `rgba(${A.c},${(.4 * (1 - n / 5)).toFixed(2)})`; ctx.beginPath(); ctx.arc(q[0], q[1], 1.2, 0, 6.283); ctx.fill(); } } }
        if (!REDUCED) requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    }

    /* arch ring of work tiles */
    const arch = $(".hero-arch", hero), ring = $(".hero-arch-ring", hero), manual = $(".hero-arch-manual", hero), copy = $(".hero-copy", hero);
    if (arch && ring) {
      const tiles = $$(".arch-tile", ring);
      const layout = () => {
        const vw = innerWidth, mob = vw <= 767; const base = vw < 620 ? 26 : vw < 980 ? 16 : 14; const d = Math.min(30, Math.round(360 / base)), step = 360 / d;
        const o = Math.max(620, Math.min(.98 * vw, 1560)); const tw = tiles[0].offsetWidth, th = tw * 6 / 5;
        const top = mob ? 0 : copy.offsetTop + copy.offsetHeight; const c = top + (vw < 620 ? 40 : 44) + th / 2 + o;
        tiles.forEach((t, i) => { if (i >= d) { t.style.display = "none"; return; } t.style.display = ""; const a = i * step * Math.PI / 180; t.style.transform = `translate(${(o * Math.sin(a)).toFixed(1)}px,${(c - o * Math.cos(a)).toFixed(1)}px) translate(-50%,-50%) rotate(${(i * step).toFixed(2)}deg)`; });
        ring.style.transformOrigin = manual.style.transformOrigin = `50% ${c.toFixed(1)}px`;
        ring.style.animationDuration = (REDUCED ? (mob ? 0 : 240) : vw < 620 ? 72 : 163.6) + "s";
        if (REDUCED && mob) ring.style.animation = "none";
        arch.dataset.ready = "true";
      };
      layout(); addEventListener("resize", layout); document.fonts?.ready.then(layout); setTimeout(layout, 500);
      /* touch drag (mobile) */
      let sx = 0, sy = 0, lock = null, ang = 0, start = 0, resumeT;
      arch.addEventListener("touchstart", (e) => { const r = arch.getBoundingClientRect(), t = e.touches[0]; if (t.clientY < r.top + r.height * .4) return; sx = t.clientX; sy = t.clientY; lock = "pending"; start = ang; arch.classList.add("dragging"); clearTimeout(resumeT); }, { passive: true });
      arch.addEventListener("touchmove", (e) => { if (!lock) return; const t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy; if (lock === "pending" && Math.hypot(dx, dy) > 7) lock = Math.abs(dx) > Math.abs(dy) ? "h" : "v"; if (lock === "h") { e.preventDefault(); ang = start + .05 * dx; manual.style.transform = `rotate(${ang}deg)`; } }, { passive: false });
      arch.addEventListener("touchend", () => { lock = null; resumeT = setTimeout(() => arch.classList.remove("dragging"), 1400); });
    }
  }

  /* ---------- statement words ---------- */
  const st = $("[data-statement]");
  if (st) {
    const ACC = ["branding", "web", "strategic", "growth", "ai", "automation"];
    const words = st.dataset.statement.split(/\s+/); const last = words.pop(); words[words.length - 1] += " " + last;
    st.innerHTML = words.map((w) => `<span class="statement-word${ACC.includes(w.toLowerCase().replace(/[.,:]/g, "")) ? " accent" : ""}">${w}</span>`).join(" ");
    const ws = $$(".statement-word", st);
    const upd = () => { if (REDUCED) { ws.forEach((w) => w.classList.add("lit")); return; } const vh = innerHeight, r = st.getBoundingClientRect(), s = .82 * vh, span = r.height + (s - .32 * vh); const p = Math.max(0, Math.min(1, (s - r.top) / span)); ws.forEach((w, i) => w.classList.toggle("lit", (i + .5) / ws.length <= 1.32 * p + .05)); };
    addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); addEventListener("resize", upd); upd();
  }

  /* ---------- capability rows ---------- */
  const fw = $(".cap-fw");
  if (fw && DESK) {
    fw.classList.add("anim"); const rows = $$(".cap-row", fw);
    const upd = () => { const vh = innerHeight; rows.forEach((row) => { const r = row.getBoundingClientRect();
      if (!row.classList.contains("cap-entered") && r.top <= .5 * vh && r.bottom > .4 * vh) row.classList.add("cap-entered");
      if (r.bottom < -200 || r.top > vh + 200) return; const rr = (r.top + r.height / 2 - vh / 2) / vh; const im = $(".cap-row-image", row);
      if (im) { const fr = im.parentElement.getBoundingClientRect(); const m = Math.max(0, Math.min(18, (fr.height - im.offsetHeight) / 2 - 1)); im.style.transform = `translateY(${Math.max(-m, Math.min(m, -18 * rr)).toFixed(1)}px)`; } }); };
    addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); addEventListener("resize", upd); upd();
  }

  /* ---------- growth scene count-ups + donut ---------- */
  const gs = $(".growth-scene");
  if (gs) {
    const fmt = (v, f) => f === "million" ? (v / 1e6).toFixed(1) + " million" : f === "k" ? (v / 1000).toFixed(1) + "K" : f === "M" ? (v / 1e6).toFixed(2) + "M" : f === "usd" ? "$" + (v / 100).toFixed(2) : f === "pct" ? (v / 100).toFixed(2) + "%" : Math.round(v).toLocaleString("en-US");
    const nums = $$("[data-count]", gs), segs = $$(".gs-seg", gs); const C = 2 * Math.PI * 40; const tot = segs.reduce((s, x) => s + +x.dataset.v, 0);
    let acc = 0; segs.forEach((s) => { const len = C * (+s.dataset.v / tot); s.style.strokeDasharray = `${len} ${C}`; s.style.strokeDashoffset = LOW ? 0 : len; s.style.transform = `rotate(${acc / tot * 360 - 90}deg)`; s.style.transformOrigin = "50% 50%"; acc += +s.dataset.v; });
    const run = () => { nums.forEach((n) => { const to = +n.dataset.count, f = n.dataset.fmt, dl = +(n.dataset.delay || 0); if (LOW) { n.textContent = fmt(to, f); return; } setTimeout(() => { const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / 1500); n.textContent = fmt(to * (1 - Math.pow(1 - k, 3)), f); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }, dl); });
      segs.forEach((s, i) => { s.style.transitionDelay = (.35 + .18 * i) + "s"; s.style.strokeDashoffset = 0; }); };
    if (LOW) run(); else { nums.forEach((n) => (n.textContent = fmt(0, n.dataset.fmt))); const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: .35 }); io.observe(gs); }
  }

  /* ---------- hub window scroll tilt ---------- */
  const hw = $(".hub-window");
  if (hw && DESK) { const upd = () => { const r = hw.getBoundingClientRect(), vh = innerHeight; if (r.bottom < -120 || r.top > vh + 120) return; const i = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2))); hw.style.setProperty("--hub-ty", (-26 * i).toFixed(1) + "px"); hw.style.setProperty("--hub-ry", (4 * i).toFixed(2) + "deg"); hw.style.setProperty("--hub-rx", (-1.6 * i).toFixed(2) + "deg"); }; addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); upd(); }

  /* ---------- work grid reveal ---------- */
  const wg = $(".worksec-grid");
  if (wg) { const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { wg.classList.add("wg-in"); io.disconnect(); } }, { threshold: .12, rootMargin: "0px 0px -8% 0px" }); io.observe(wg); }

  /* ---------- cases: random 3 with unique tags ---------- */
  const cg = $("[data-shuffle]");
  if (cg) { const cards = $$(".cs-card", cg).sort(() => Math.random() - .5); const pick = [], tags = new Set(); for (const c of cards) { const t = $(".cs-tag", c).textContent; if (!tags.has(t)) { tags.add(t); pick.push(c); } if (pick.length === 3) break; } for (const c of cards) if (pick.length < 3 && !pick.includes(c)) pick.push(c); cards.forEach((c) => (c.hidden = !pick.includes(c))); pick.forEach((c) => cg.appendChild(c)); }

  /* ---------- blog carousel arrows ---------- */
  const track = $(".blogx-carousel");
  $$(".blogx-arrow").forEach((b) => b.addEventListener("click", () => track.scrollBy({ left: 440 * +b.dataset.dir, behavior: "smooth" })));

  /* ---------- reel video (the one element with sound) ---------- */
  const v = $(".reel-video"), mute = $(".reel-mute");
  if (v) {
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { v.src = v.dataset.src; v.autoplay = true; v.play().catch(() => {}); io.disconnect(); } }, { rootMargin: "600px 0px" }); io.observe(v);
    mute.addEventListener("click", () => { if (!v.src) v.src = v.dataset.src; v.muted = !v.muted; if (!v.muted && v.paused) v.play().catch(() => {}); mute.setAttribute("aria-pressed", String(!v.muted)); mute.setAttribute("aria-label", v.muted ? "Unmute reel" : "Mute reel"); });
  }
})();
