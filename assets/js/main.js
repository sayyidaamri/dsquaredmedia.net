/* Lumencraft — global behaviour (written from scratch for this build) */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LOW = matchMedia("(prefers-reduced-motion: reduce), (max-width: 767px)").matches;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROOT = document.body.dataset.root || "./";
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  window.LC = { $, $$, LOW, REDUCED, store, ROOT };

  /* toast */
  const toastEl = $(".toast"); let toastT;
  LC.toast = (msg) => { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 2200); };

  /* scroll restoration like the reference: start at top unless hash */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo(0, 0);

  /* intro fade safety */
  const intro = $(".intro-fade"); if (intro) setTimeout(() => intro.remove(), 1450);

  /* nav scrolled state */
  const nav = $(".nav");
  const onNav = () => nav && nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onNav, { passive: true }); onNav();

  /* ---------- mobile drawer ---------- */
  const drawer = $("#mobile-drawer"), burger = $(".nav-burger");
  if (drawer && burger) {
    const closeBtn = $(".md-close", drawer);
    const open = () => { drawer.classList.add("open"); burger.setAttribute("aria-expanded", "true"); document.body.classList.add("no-scroll", "drawer-open"); setTimeout(() => closeBtn.focus(), 60); };
    const close = () => { drawer.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); document.body.classList.remove("no-scroll", "drawer-open"); burger.focus(); };
    burger.addEventListener("click", open); closeBtn.addEventListener("click", close);
    $$("a", drawer).forEach((a) => a.addEventListener("click", () => drawer.classList.remove("open")));
    drawer.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") { const f = $$("a,button", drawer); const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
  }

  /* ---------- space drift ---------- */
  const sd = $(".space-drift");
  if (sd && !LOW) {
    const ctx = sd.getContext("2d"); let W, H, stars = [], mx = .5, my = .5, cx = .5, cy = .5, raf, dpr = Math.min(devicePixelRatio || 1, 2);
    const resize = () => { W = innerWidth; H = innerHeight; sd.width = W * dpr; sd.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); const n = Math.min(80, Math.max(24, Math.floor(W * H / 24000))); stars = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), z: .18 + Math.random() * .82, r: .4 + Math.random() * 1.1, s: .006 + Math.random() * .014 })); };
    resize(); addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mx = e.clientX / W; my = e.clientY / H; }, { passive: true });
    const tick = () => { ctx.clearRect(0, 0, W, H); cx += (mx - cx) * .045; cy += (my - cy) * .045;
      for (const s of stars) { s.y -= .01 * s.s; if (s.y < -.02) { s.y = 1.02; s.x = Math.random(); }
        const ox = (cx - .5) * s.z * 46, oy = (cy - .5) * s.z * 46; ctx.beginPath(); ctx.arc(s.x * W + ox, s.y * H + oy, s.r * s.z + .2, 0, 6.283); ctx.fillStyle = `rgba(150,160,255,${(.08 + .2 * s.z).toFixed(3)})`; ctx.fill(); }
      raf = requestAnimationFrame(tick); };
    tick();
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else tick(); });
  }

  /* ---------- reveal ---------- */
  const revIO = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); revIO.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -8% 0px" }) : null;
  $$(".reveal").forEach((el) => (REDUCED || !revIO ? el.classList.add("is-visible") : revIO.observe(el)));

  /* ---------- lit words (scroll scrubbed) ---------- */
  const litHeads = $$("[data-lit]");
  if (litHeads.length) {
    const upd = () => { const vh = innerHeight; litHeads.forEach((h) => { const w = h._w || (h._w = $$(".lit-word", h)); if (LOW) { w.forEach((x) => x.classList.add("lit")); return; } const r = h.getBoundingClientRect(); const start = vh * .85, span = r.height + (start - vh * .4); const p = Math.max(0, Math.min(1, (start - r.top) / span)); w.forEach((x, i) => x.classList.toggle("lit", (i + .5) / w.length <= 1.25 * p + .06)); }); };
    let tk = 0; addEventListener("scroll", () => { if (!tk) { tk = requestAnimationFrame(() => { tk = 0; upd(); }); } }, { passive: true }); addEventListener("resize", upd); upd();
  }

  /* ---------- footer statement words ---------- */
  const fs = $(".caf-state");
  if (fs) { const words = $$(".fw", fs); if (LOW) words.forEach((w) => w.classList.add("lit")); else { const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { words.forEach((w, i) => setTimeout(() => w.classList.add("lit"), 140 * i)); io.disconnect(); } }, { threshold: .5 }); io.observe(fs); } }

  /* ---------- FAQ accordions (single-open per list) ---------- */
  $$("[data-faq]").forEach((list) => list.addEventListener("click", (e) => {
    const q = e.target.closest(".faq-q"); if (!q) return; const item = q.parentElement; const was = item.classList.contains("open");
    $$(".faq-item.open", list).forEach((it) => { it.classList.remove("open"); $(".faq-q", it).setAttribute("aria-expanded", "false"); });
    if (!was) { item.classList.add("open"); q.setAttribute("aria-expanded", "true"); }
  }));

  /* ---------- generic tabs: [data-tabs] > [data-tab] + [data-panel] ---------- */
  $$("[data-tabs]").forEach((root) => {
    const tabs = $$("[data-tab]", root), panels = $$("[data-panel]", root);
    const show = (k) => { tabs.forEach((t) => { const on = t.dataset.tab === k; t.classList.toggle("active", on); t.setAttribute("aria-selected", on); }); panels.forEach((p) => { const on = p.dataset.panel === k; p.hidden = !on; if (on) { p.classList.remove("tab-in"); void p.offsetWidth; p.classList.add("tab-in"); } }); };
    tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab)));
  });

  /* ---------- count-ups ---------- */
  const countIO = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; countIO.unobserve(e.target); const el = e.target, to = parseFloat(el.dataset.countup), dec = (el.dataset.countup.split(".")[1] || "").length; if (LOW) { el.textContent = to.toFixed(dec); return; } const t0 = performance.now(), D = 1500; const step = (t) => { const k = Math.min(1, (t - t0) / D), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }), { threshold: .4 });
  $$("[data-countup]").forEach((el) => countIO.observe(el));

  /* ---------- work likes ---------- */
  const liked = new Set(store.get("lc_liked", []));
  $$(".wc-like").forEach((b) => {
    const k = b.dataset.like, base = +b.dataset.base, num = $("span", b);
    const render = () => { const on = liked.has(k); b.classList.toggle("liked", on); b.setAttribute("aria-pressed", on); num.textContent = base + (on ? 1 : 0); };
    render();
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); liked.has(k) ? liked.delete(k) : liked.add(k); store.set("lc_liked", [...liked]); render(); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); });
  });

  /* ---------- page orbs parallax ---------- */
  const orbs = $$(".page-orb");
  if (orbs.length && !LOW) { const X = [46, -56, 36], Y = [30, 44, -38]; let tx = 0, ty = 0, x = 0, y = 0, run = false;
    const loop = () => { x += (tx - x) * .06; y += (ty - y) * .06; orbs.forEach((o, i) => (o.style.transform = `translate(${(x * X[i % 3]).toFixed(1)}px,${(y * Y[i % 3]).toFixed(1)}px)`)); if (Math.abs(tx - x) + Math.abs(ty - y) > .0015) requestAnimationFrame(loop); else run = false; };
    addEventListener("pointermove", (e) => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; if (!run) { run = true; requestAnimationFrame(loop); } }, { passive: true }); }

  /* ---------- arcs-only globe (inner page heroes) ---------- */
  $$("canvas[data-arcs]").forEach((cv) => {
    if (LOW) return; const ctx = cv.getContext("2d"); const dpr = Math.min(devicePixelRatio || 1, 2); let W, H, g = Math.random() * 6.28;
    const pts = []; for (let i = 0; i < 8; i++) { let a, b, d; do { a = rndPt(); b = rndPt(); d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); } while (d < 1.15); pts.push({ a, b, ph: Math.random(), c: ["86,97,255", "177,75,255", "255,0,109"][i % 3] }); }
    function rndPt() { const la = (Math.random() * 120 - 60) * Math.PI / 180, lo = Math.random() * 6.283; return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)]; }
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }; size(); addEventListener("resize", size);
    const tilt = -.34, ct = Math.cos(tilt), st = Math.sin(tilt);
    const proj = (p, R, cx, cy) => { const cg = Math.cos(g), sg = Math.sin(g); let x = p[0] * cg - p[2] * sg, z = p[0] * sg + p[2] * cg, y = p[1]; const y2 = y * ct - z * st, z2 = y * st + z * ct; return [cx + x * R, cy - y2 * R, z2]; };
    const slerp = (a, b, t) => { const m = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; const l = Math.hypot(...m) || 1; const lift = 1 + .4 * Math.sin(Math.PI * t); return m.map((v) => v / l * lift); };
    const draw = (now) => { ctx.clearRect(0, 0, W, H); const R = Math.min(.42 * W, 330), cx = W / 2, cy = H * .5; g += .0009;
      for (const A of pts) { const pa = proj(A.a, R, cx, cy), pb = proj(A.b, R, cx, cy); if (pa[2] < -.25 && pb[2] < -.25) continue;
        ctx.beginPath(); for (let t = 0; t <= 1.001; t += .05) { const q = proj(slerp(A.a, A.b, t), R, cx, cy); t ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.lineWidth = 1; ctx.stroke();
        const p = (now / 4600 + A.ph) % 1; for (let n = 4; n >= 0; n--) { const tt = p - n * .04; if (tt < 0) continue; const q = proj(slerp(A.a, A.b, tt), R, cx, cy);
          if (n === 0) { const gr = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 11); gr.addColorStop(0, `rgba(${A.c},.3)`); gr.addColorStop(1, `rgba(${A.c},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(q[0], q[1], 11, 0, 6.283); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(q[0], q[1], 1.7, 0, 6.283); ctx.fill(); }
          else { ctx.fillStyle = `rgba(${A.c},${(.4 * (1 - n / 5)).toFixed(2)})`; ctx.beginPath(); ctx.arc(q[0], q[1], 1.1, 0, 6.283); ctx.fill(); } } }
      requestAnimationFrame(draw); };
    requestAnimationFrame(draw);
  });

  /* ---------- testimonial wall auto-scroll ---------- */
  $$("[data-tw]").forEach((tw) => {
    const vp = $(".tw-viewport", tw); if (!vp || LOW) return; let paused = false, pos = 0;
    vp.addEventListener("mouseenter", () => (paused = true)); vp.addEventListener("mouseleave", () => (paused = false)); vp.addEventListener("touchstart", () => (paused = true), { passive: true });
    const half = () => $(".tw-track", tw).scrollWidth / 2;
    const loop = () => { if (!paused) { pos += .55; if (pos >= half()) pos -= half(); vp.scrollLeft = pos; } requestAnimationFrame(loop); }; loop();
  });

  /* ---------- cookie banner + consent preferences ---------- */
  const cookie = $(".cookie"), prefs = $("#prefs-modal");
  const consent = store.get("lc_consent", null);
  const setLift = () => { const h = cookie && !cookie.hidden && cookie.classList.contains("show") ? cookie.offsetHeight + 16 : 0; document.documentElement.style.setProperty("--consent-lift", h + "px"); };
  if (cookie && !consent) { cookie.hidden = false; setTimeout(() => { cookie.classList.add("show"); setLift(); }, 900); }
  const closeCookie = () => { cookie.classList.remove("show"); setTimeout(() => { cookie.hidden = true; setLift(); }, 400); };
  const saveConsent = (v) => { store.set("lc_consent", v); if (cookie && !cookie.hidden) closeCookie(); };
  $(".ck-accept")?.addEventListener("click", () => { saveConsent({ analytics: true, marketing: true }); LC.toast("Preferences saved"); });
  $(".ck-decline")?.addEventListener("click", () => { saveConsent({ analytics: false, marketing: false }); LC.toast("Only essential cookies will be used"); });
  const openModal = (m) => { m.classList.add("open"); m._prev = document.activeElement; document.body.classList.add("no-scroll"); setTimeout(() => $("[data-close]", m)?.focus(), 50); };
  const closeModal = (m) => { m.classList.remove("open"); document.body.classList.remove("no-scroll"); m._prev?.focus?.(); };
  LC.openModal = openModal; LC.closeModal = closeModal;
  $$(".modal").forEach((m) => { m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); }); m.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(m); }); });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-open-prefs]") && prefs) { e.preventDefault(); const c = store.get("lc_consent", {}) || {}; $$("[data-pref]", prefs).forEach((i) => (i.checked = !!c[i.dataset.pref])); openModal(prefs); } });
  $("[data-save-prefs]")?.addEventListener("click", () => { const v = {}; $$("[data-pref]", prefs).forEach((i) => (v[i.dataset.pref] = i.checked)); saveConsent(v); closeModal(prefs); LC.toast("Preferences saved"); });

  /* ---------- chat widget ---------- */
  const launch = $("#chat-launch"), panel = $("#d2c-panel"), floatWrap = $("#chat-float"), anchor = $("#chat-nav-anchor");
  if (launch && panel) {
    const body = $(".d2c-body", panel), form = $(".d2c-composer", panel), ta = $("textarea", panel), sendB = $(".d2c-cbtn", panel), label = $(".d2c-label", launch);
    let open = false, stage = "prechat", busy = false; const DEFAULT = "Chat with us";
    const place = () => { const wide = innerWidth >= 981; if (wide && anchor && launch.parentElement !== anchor) anchor.appendChild(launch); if (!wide && launch.parentElement !== floatWrap) floatWrap.appendChild(launch); document.body.classList.toggle("chat-in-nav", wide); floatWrap.style.display = wide ? "none" : ""; };
    place(); addEventListener("resize", place);
    const ratio = () => { const m = document.documentElement.scrollHeight - innerHeight; return m > 0 ? scrollY / m : 0; };
    const onScroll = () => { if (open) return; const r = ratio(); label.textContent = scrollY < 5 && !onScroll.moved ? DEFAULT : r < .12 ? "What's up! 👋" : r < .62 ? "Need an estimate?" : "Click to Chat"; if (scrollY > 5) onScroll.moved = true; floatWrap.classList.toggle("raised", r > .9); };
    addEventListener("scroll", onScroll, { passive: true }); setTimeout(() => { onScroll.moved = true; onScroll(); }, 1200);
    const scrollDown = () => (body.scrollTop = body.scrollHeight);
    const linkify = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    const add = (who, text, actions) => { const m = document.createElement("div"); m.className = "d2c-msg " + who; m.innerHTML = linkify(text); body.appendChild(m); if (actions) { const a = document.createElement("div"); a.className = "d2c-actions"; a.innerHTML = actions.map(([t, h]) => `<a href="${h}">${t}</a>`).join(""); body.appendChild(a); } scrollDown(); };
    const typing = (ms) => new Promise((res) => { const t = document.createElement("div"); t.className = "d2c-typing"; t.innerHTML = "<i></i><i></i><i></i>"; body.appendChild(t); scrollDown(); setTimeout(() => { t.remove(); res(); }, ms); });
    const GREET = "Hi, I'm Lumencraft's AI assistant. Are you looking for a project estimate today, or is there something else I can help with?";
    const reply = (q) => { const s = q.toLowerCase();
      if (/(price|cost|estimate|budget|quote|how much)/.test(s)) return ["Happy to ballpark it. Most brand identities start around $6K, websites land between $8K and $35K, and monthly marketing starts near $1.5K. What are you looking to build?", null];
      if (/(web|site|shop|store|landing)/.test(s)) return ["Nice. For a website, the main cost drivers are page count, e-commerce and integrations. A typical marketing site takes 6–10 weeks. Want me to set up a quick call with the team to scope it?", [["Book a call", ROOT + "book-a-call.html"], ["Call " + "(954) 555-0148", "tel:+19545550148"]]];
      if (/(seo|google|ads|rank|marketing|leads|social)/.test(s)) return ["We run SEO, Google Ads and paid social for businesses across South Florida and nationwide. Results are tracked to calls, forms and booked jobs. What does a good month look like for you right now?", [["See case studies", ROOT + "case-studies.html"]]];
      if (/(ai|automat|chatbot|gpt|crm)/.test(s)) return ["AI is a favourite topic here. We build chat agents, lead routing and workflow automations that save teams hours a week. What's one task that takes more time than it should?", [["AI & automation", ROOT + "services/ai.html"]]];
      if (/(brand|logo|identity|design|packag)/.test(s)) return ["Brand work starts with a short discovery workshop, then identity concepts, refinement and a full style guide. Usually 4–6 weeks. Do you have an existing logo, or is this from scratch?", null];
      if (/(hi|hello|hey|yo)\b/.test(s)) return ["Hey! 👋 Tell me a little about your business and what you're hoping to improve, and I'll point you in the right direction.", null];
      if (s.trim().length < 3) return ["Sorry, I didn't catch that. Mind rephrasing?", null];
      return ["Thanks, that's helpful. A strategist will follow up with specifics. In the meantime you can grab a time on the calendar or reach us at hello@lumencraft.studio.", [["Book a call", ROOT + "book-a-call.html"], ["Email us", "mailto:hello@lumencraft.studio"]]]; };
    const setOpen = async (v) => { open = v; panel.classList.toggle("open", v); launch.classList.toggle("is-open", v); launch.setAttribute("aria-expanded", v); if (v) panel.removeAttribute("inert"); else panel.setAttribute("inert", "");
      if (v && stage === "prechat") { stage = "chat"; const lbl = label.textContent; if (lbl !== DEFAULT) { add("bot", lbl); await typing(900); } add("bot", GREET); }
      if (v) setTimeout(() => ta.focus(), 120); else launch.focus(); };
    launch.addEventListener("click", () => setOpen(!open));
    $(".d2c-close", panel).addEventListener("click", () => setOpen(false));
    panel.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    const grow = () => { ta.style.height = "auto"; ta.style.height = Math.min(200, ta.scrollHeight) + "px"; sendB.disabled = !ta.value.trim() || busy; };
    ta.addEventListener("input", grow);
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener("submit", async (e) => { e.preventDefault(); const q = ta.value.trim(); if (!q || busy) return; add("user", q); ta.value = ""; busy = true; grow(); await typing(900 + Math.random() * 700); const [t, a] = reply(q); add("bot", t, a); busy = false; grow(); });
    document.addEventListener("click", (e) => { const o = e.target.closest("[data-open-chat]"); if (o) { e.preventDefault(); setOpen(true); } });
  }
})();
