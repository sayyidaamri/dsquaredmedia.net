/* Lumencraft — inner page behaviour */
(() => {
  "use strict";
  const { $, $$, LOW, REDUCED } = window.LC;

  /* ---------- chip filters (work / case studies / blog) ---------- */
  const chipFilter = (btnSel, attr, items, empty, onDone) => {
    const btns = $$(btnSel); if (!btns.length) return;
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.toggle("active", x === b)); const v = b.dataset[attr]; let n = 0;
      items().forEach((el) => { const ok = v === "all" || (el.dataset.tags || el.dataset.tag || el.dataset.cats || "").includes(v); el.classList.toggle("f-out", !ok); el.hidden = !ok; if (ok) { n++; el.classList.remove("appear"); void el.offsetWidth; el.classList.add("appear"); } });
      if (empty) empty.hidden = n > 0; onDone && onDone(v);
    }));
  };
  chipFilter(".wk-filter button", "filter", () => $$(".wk-mosaic .workcard"), $(".wk-empty"));
  chipFilter(".cs-filter button", "cfilter", () => $$("#cs-all .cs-card").map((c) => { c.classList.add("is-visible"); return c; }));
  /* blog: category filter + load more */
  const moreBtn = $("[data-more]");
  if (moreBtn) {
    const items = () => $$(".blog-grid .blog-item");
    chipFilter(".blog-cats button", "bcat", () => [...items(), $(".blog-featured")], $(".blog-empty"), (v) => { moreBtn.parentElement.hidden = v !== "all" || !items().some((i) => i.classList.contains("is-more") && i.hidden); });
    moreBtn.addEventListener("click", () => { items().filter((i) => i.hidden).forEach((i, k) => { i.hidden = false; i.style.animationDelay = k * 60 + "ms"; i.classList.add("appear"); }); moreBtn.parentElement.hidden = true; });
  }

  /* ---------- blog post: progress, TOC, share ---------- */
  const post = $(".post-body");
  if (post) {
    const bar = $(".reading-progress i");
    const prog = () => { const m = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${m > 0 ? Math.min(1, scrollY / m) : 0})`; };
    addEventListener("scroll", prog, { passive: true }); prog();
    const heads = $$("h2, h3", post).filter((h) => !h.closest(".aiseo-hub"));
    const list = $(".toc-list");
    if (heads.length >= 2 && list) {
      heads.forEach((h) => { if (!h.id) h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); });
      list.innerHTML = heads.map((h) => `<li class="${h.tagName.toLowerCase()}"><a href="#${h.id}">${h.textContent}</a></li>`).join("");
      const links = $$("a", list);
      const go = (e) => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); const t = document.getElementById(a.getAttribute("href").slice(1)); t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }); history.replaceState(null, "", a.getAttribute("href")); };
      list.addEventListener("click", go);
      const seen = new Set(); const io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target))); const first = heads.find((h) => seen.has(h)); if (first) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + first.id)); }, { rootMargin: "-110px 0px -70% 0px" });
      heads.forEach((h) => io.observe(h));
      const mt = $(".toc-mobile");
      if (mt) { const drop = document.createElement("ul"); drop.className = "toc-drop toc-list"; drop.hidden = true; drop.innerHTML = list.innerHTML; mt.after(drop); drop.addEventListener("click", (e) => { go(e); drop.hidden = true; mt.setAttribute("aria-expanded", "false"); }); mt.addEventListener("click", () => { drop.hidden = !drop.hidden; mt.setAttribute("aria-expanded", String(!drop.hidden)); }); }
    } else if (list) list.closest(".bp-side").hidden = true;
    const cp = $("[data-copy]");
    cp?.addEventListener("click", async () => { try { await navigator.clipboard.writeText(location.href); } catch { const t = document.createElement("textarea"); t.value = location.href; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); } cp.classList.add("done"); setTimeout(() => cp.classList.remove("done"), 1800); });
  }

  /* ---------- industries explorer ---------- */
  const ex = $("[data-explore]");
  if (ex) { const rows = $$(".in-row", ex), shots = $$(".in-shot", ex); const set = (i) => { rows.forEach((r) => r.classList.toggle("active", r.dataset.i === i)); shots.forEach((s) => s.classList.toggle("on", s.dataset.i === i)); };
    rows.forEach((r) => { r.addEventListener("mouseenter", () => set(r.dataset.i)); r.addEventListener("focusin", () => set(r.dataset.i)); }); }

  /* ---------- about: approach steps + team modal ---------- */
  const steps = $$(".approach-step");
  if (steps.length && innerWidth > 980) { const upd = () => { const c = innerHeight * .45; let best = steps[0], d = 1e9; steps.forEach((s) => { const r = s.getBoundingClientRect(); const dd = Math.abs(r.top + 40 - c); if (dd < d) { d = dd; best = s; } }); steps.forEach((s) => s.classList.toggle("active", s === best)); }; addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); upd(); }
  const mm = $("#member-modal"), td = $("#team-data");
  if (mm && td) { const data = JSON.parse(td.textContent); $$("[data-member]").forEach((b) => b.addEventListener("click", () => { const m = data[+b.dataset.member]; $(".mm-photo", mm).src = m.p; $(".mm-photo", mm).alt = m.n; $("#mm-name").textContent = m.n; $(".mm-role", mm).textContent = m.r; $(".mm-bio", mm).textContent = m.b; LC.openModal(mm); })); }

  /* ---------- validation helper ---------- */
  const validate = (fld) => { const i = $("input,textarea,select", fld); if (!i) return true; let ok = true; if (i.required && !i.value.trim()) ok = false; if (ok && i.type === "email" && i.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value)) ok = false; if (ok && i.name === "phone" && i.value.replace(/\D/g, "").length < 10) ok = false; fld.classList.toggle("invalid", !ok); fld.classList.toggle("valid", ok && !!i.value.trim()); return ok; };
  const wireForm = (form, onOk) => {
    const flds = $$(".fld", form);
    flds.forEach((f) => { const i = $("input,textarea,select", f); if (!i) return; i.addEventListener("blur", () => i.value && validate(f)); i.addEventListener("input", () => f.classList.contains("invalid") && validate(f)); });
    form.addEventListener("submit", (e) => { e.preventDefault(); const bad = flds.filter((f) => !validate(f)); if (bad.length) { $("input,textarea,select", bad[0]).focus(); return; } onOk(); });
  };

  /* ---------- contact form ---------- */
  const cf = $(".ct-form");
  if (cf) {
    const req = $$("[required]", cf), bar = $(".ct-progress-bar i"), lab = $(".ct-progress-label b"), phone = $("#f-phone");
    const prog = () => { const n = req.filter((i) => i.value.trim()).length; const p = Math.round(n / req.length * 100); bar.style.width = p + "%"; lab.textContent = p + "%"; };
    cf.addEventListener("input", prog); cf.addEventListener("change", prog);
    phone.addEventListener("input", () => { const d = phone.value.replace(/\D/g, "").slice(0, 10); phone.value = d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d; });
    const succ = $(".ct-success"), btn = $(".ct-submit", cf);
    wireForm(cf, () => { btn.classList.add("loading"); $("span", btn).textContent = "Sending…"; setTimeout(() => { cf.hidden = true; $(".ct-progress").hidden = true; succ.hidden = false; btn.classList.remove("loading"); $("span", btn).textContent = "Send my project brief"; succ.scrollIntoView({ behavior: "smooth", block: "center" }); }, 900); });
    $("[data-reset]", succ).addEventListener("click", () => { cf.reset(); $$(".fld", cf).forEach((f) => f.classList.remove("valid", "invalid")); prog(); succ.hidden = true; cf.hidden = false; $(".ct-progress").hidden = false; });
  }

  /* ---------- booking calendar ---------- */
  const cal = $("[data-cal]");
  if (cal) {
    const now = new Date(); now.setHours(0, 0, 0, 0); let view = new Date(now.getFullYear(), now.getMonth(), 1), sel = null, len = 15;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "local"; $("[data-tz]").textContent = tz.replace(/_/g, " ");
    const days = $("[data-days]"), title = $("[data-mtitle]"), slots = $("[data-slots]"), selH = $("[data-sel]"), modal = $("#cal-modal");
    const open = (d) => d >= now && d.getDay() !== 0 && d.getDay() !== 6 && (d - now) / 864e5 <= 60;
    const fmtD = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const render = () => {
      title.textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      $("[data-m='-1']", cal).disabled = view <= new Date(now.getFullYear(), now.getMonth(), 1);
      const first = (view.getDay() + 6) % 7, n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(); let h = "";
      for (let i = 0; i < first; i++) h += "<span></span>";
      for (let d = 1; d <= n; d++) { const dt = new Date(view.getFullYear(), view.getMonth(), d); const o = open(dt); h += `<button type="button" class="${o ? "open" : ""}${sel && +dt === +sel ? " sel" : ""}${+dt === +now ? " today" : ""}" ${o ? "" : "disabled"} data-d="${+dt}" aria-label="${fmtD(dt)}">${d}</button>`; }
      days.innerHTML = h;
    };
    const renderSlots = () => { if (!sel) return; selH.textContent = fmtD(sel); const seed = sel.getDate(); const out = []; for (let m = 9 * 60; m < 17 * 60; m += len === 15 ? 30 : 60) { if ((m / 30 + seed) % 5 === 0) continue; const t = new Date(sel); t.setMinutes(m); if (t < new Date()) continue; out.push(t); } slots.innerHTML = out.length ? out.map((t, i) => `<button type="button" style="animation-delay:${i * 30}ms" data-t="${+t}">${t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</button>`).join("") : '<p class="cal-empty">No times left today. Try another day.</p>'; };
    days.addEventListener("click", (e) => { const b = e.target.closest("button[data-d]"); if (!b) return; sel = new Date(+b.dataset.d); render(); renderSlots(); });
    $$(".cal-nav", cal).forEach((b) => b.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + +b.dataset.m, 1); render(); }));
    $$("[data-len]", cal).forEach((b) => b.addEventListener("click", () => { len = +b.dataset.len; $$("[data-len]", cal).forEach((x) => x.classList.toggle("active", x === b)); renderSlots(); }));
    let picked;
    slots.addEventListener("click", (e) => { const b = e.target.closest("button[data-t]"); if (!b) return; picked = new Date(+b.dataset.t); $("[data-when]", modal).textContent = `${len}-minute call · ${fmtD(picked)} at ${picked.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} (${tz.replace(/_/g, " ")})`; $('[data-step="form"]', modal).hidden = false; $('[data-step="done"]', modal).hidden = true; LC.openModal(modal); });
    wireForm($(".cal-form", modal), () => { $('[data-step="form"]', modal).hidden = true; $('[data-step="done"]', modal).hidden = false; $("[data-done]", modal).textContent = `See you ${fmtD(picked)} at ${picked.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}. (Demo only: no invite was sent.)`; });
    render();
  }

  /* ---------- careers apply modal ---------- */
  const am = $("#apply-modal");
  if (am) { $$("[data-apply]").forEach((b) => b.addEventListener("click", () => { $("#ap-t").textContent = "Apply: " + b.dataset.apply; $('[data-step="form"]', am).hidden = false; $('[data-step="done"]', am).hidden = true; $(".apply-form", am).reset(); $$(".fld", am).forEach((f) => f.classList.remove("valid", "invalid")); LC.openModal(am); }));
    wireForm($(".apply-form", am), () => { $('[data-step="form"]', am).hidden = true; $('[data-step="done"]', am).hidden = false; }); }

  /* ---------- flex: rotating phrase ---------- */
  const rr = $(".rr[data-phrases]");
  if (rr && !REDUCED) { const ph = JSON.parse(rr.dataset.phrases); let k = 0; setInterval(() => { const cur = $(".rr-phrase", rr); cur.classList.add("out"); setTimeout(() => { k = (k + 1) % ph.length; cur.textContent = ph[k]; cur.classList.remove("out"); cur.classList.remove("in"); void cur.offsetWidth; cur.classList.add("in"); }, 420); }, 2400); }

  /* ---------- flex: drag-able auto marquee ---------- */
  const fv = $(".fxr-viewport");
  if (fv) { const tr = $(".fxr-track", fv); let x = 0, v = REDUCED ? 0 : .45, drag = false, sx = 0, sxx = 0, moved = 0, hover = false;
    const half = () => tr.scrollWidth / 2;
    const loop = () => { if (!drag && !hover) x -= v; if (x <= -half()) x += half(); if (x > 0) x -= half(); tr.style.transform = `translate3d(${x}px,0,0)`; requestAnimationFrame(loop); }; loop();
    fv.addEventListener("pointerenter", () => (hover = true)); fv.addEventListener("pointerleave", () => { hover = false; drag = false; fv.classList.remove("drag"); });
    fv.addEventListener("pointerdown", (e) => { drag = true; moved = 0; sx = e.clientX; sxx = x; fv.classList.add("drag"); });
    addEventListener("pointermove", (e) => { if (!drag) return; moved = Math.abs(e.clientX - sx); x = sxx + (e.clientX - sx); });
    addEventListener("pointerup", () => { drag = false; fv.classList.remove("drag"); });
    fv.addEventListener("click", (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true); }

  /* ---------- flex: plan select ---------- */
  const plans = $$(".fx-plan");
  plans.forEach((p) => p.addEventListener("click", () => { plans.forEach((x) => { x.classList.toggle("sel", x === p); x.setAttribute("aria-pressed", String(x === p)); }); $("[data-plan-name]").textContent = p.dataset.plan; $("[data-plan-link]").href = $("[data-plan-link]").href.split("?")[0] + "?plan=" + encodeURIComponent(p.dataset.plan); }));

  /* ---------- starfields: flex sky + 404 sky with astronaut ---------- */
  const sky = (cv, astronaut) => {
    const ctx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2); let W, H, stars = [], mx = 0, my = 0, t = 0;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); stars = Array.from({ length: Math.round(W * H / 4200) }, () => { const c = Math.random(); return { x: Math.random() * W, y: Math.random() * H, r: .5 + Math.random() * 1.7, z: .25 + Math.random(), a: .25 + Math.random() * .6, s: .4 + Math.random() * 1.2, c: c < .07 ? "168,143,255" : c < .14 ? "86,97,255" : "255,255,255" }; }); };
    size(); addEventListener("resize", size); cv.parentElement.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) / W - .5; my = (e.clientY - r.top) / H - .5; });
    const A = { x: .5, y: .62, vx: .22, vy: -.12, rot: 0 };
    const drawAstro = (x, y, rot, sc) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 52); g.addColorStop(0, "rgba(86,97,255,.28)"); g.addColorStop(1, "rgba(86,97,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 52, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#dfe3f4"; ctx.beginPath(); ctx.roundRect(-14, -2, 28, 30, 9); ctx.fill(); ctx.fillStyle = "#c3c8de"; ctx.beginPath(); ctx.roundRect(-20, 0, 8, 22, 4); ctx.roundRect(12, 0, 8, 22, 4); ctx.fill(); ctx.beginPath(); ctx.roundRect(-12, 26, 10, 14, 4); ctx.roundRect(2, 26, 10, 14, 4); ctx.fill();
      ctx.fillStyle = "#eef1fb"; ctx.beginPath(); ctx.arc(0, -14, 15, 0, 6.283); ctx.fill(); const vg = ctx.createLinearGradient(-9, -22, 9, -6); vg.addColorStop(0, "#8fa2ff"); vg.addColorStop(.5, "#3f49c8"); vg.addColorStop(1, "#120c33"); ctx.fillStyle = vg; ctx.beginPath(); ctx.roundRect(-10, -21, 20, 13, 6); ctx.fill();
      [["#39d98a", -6], ["#ff006d", 0], ["#5661ff", 6]].forEach(([c, dx]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(dx, 9, 1.8, 0, 6.283); ctx.fill(); }); ctx.restore(); };
    const frame = () => { t += 1 / 60; ctx.clearRect(0, 0, W, H);
      for (const s of stars) { const a = s.a * (.55 + .45 * Math.sin(t * s.s + s.x)); const y = (s.y + t * s.z * 4) % H; ctx.fillStyle = `rgba(${s.c},${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(s.x + mx * s.z * 28, y + my * s.z * 28, s.r * .8, 0, 6.283); ctx.fill(); }
      if (astronaut) { A.x += A.vx / W * (W > 700 ? 1 : 1.4); A.y += (A.vy + .06 * Math.sin(.6 * t)) / H; const px = A.x * W, py = A.y * H; if (px > W + 110) A.x = -110 / W; if (py < -110) A.y = (H + 110) / H; const rot = .3 * Math.sin(t * .5);
        ctx.strokeStyle = "rgba(168,143,255,.35)"; ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.moveTo(px - 60, py + 60); ctx.quadraticCurveTo(px - 20, py + 40, px, py + 10); ctx.stroke(); ctx.setLineDash([]); drawAstro(px, py, rot, W > 700 ? 1.5 : 1.05); }
      if (!LOW) requestAnimationFrame(frame); };
    frame();
  };
  const fs = $(".fx-hero-sky"); if (fs) sky(fs, false);
  const nf = $(".nf-sky"); if (nf) sky(nf, true);
})();
