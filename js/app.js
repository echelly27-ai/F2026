(() => {
  const Store = FuelRestStore;
  const CATS = Store.CATS;

  let data = Store.load();
  let quality = 3;
  const today = Store.isoDate(0);

  const els = {
    mealOptions: document.getElementById("meal-options"),
    mealList: document.getElementById("meal-list"),
    mealCount: document.getElementById("meal-count"),
    sleepForm: document.getElementById("sleep-form"),
    sleepDate: document.getElementById("sleep-date"),
    sleepBed: document.getElementById("sleep-bed"),
    sleepWake: document.getElementById("sleep-wake"),
    sleepDuration: document.getElementById("sleep-duration"),
    sleepList: document.getElementById("sleep-list"),
    qualityDots: document.querySelectorAll("#quality-dots button"),
    ring: document.getElementById("sleep-ring"),
    verdict: document.getElementById("diet-verdict"),
    tankStage: document.getElementById("tank-stage"),
    tankLabel: document.getElementById("tank-protocol-label"),
    statProtocol: document.getElementById("stat-protocol"),
    statKcal: document.getElementById("stat-kcal"),
    statSleep: document.getElementById("stat-sleep"),
    statDate: document.getElementById("stat-date"),
    statClock: document.getElementById("stat-clock"),
    hudParticles: document.getElementById("hud-particles"),
    hudMass: document.getElementById("hud-mass"),
    tankFill: document.getElementById("tank-fill"),
    tankEmpty: document.getElementById("tank-empty"),
    composition: document.getElementById("composition"),
    donutKcal: document.getElementById("donut-kcal"),
    toast: document.getElementById("toast"),
    reset: document.getElementById("reset-lab")
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function prettyDate(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function persist() {
    Store.save(data);
    renderAll();
  }

  const SleepRing = {
    dragging: null,
    bed: 23 + 10 / 60,
    wake: 6 + 50 / 60,
    draw() {
      const canvas = els.ring;
      const ctx = canvas.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const css = canvas.clientWidth || 280;
      canvas.width = css * dpr;
      canvas.height = css * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cx = css / 2;
      const cy = css / 2;
      const r = css * 0.34;
      ctx.clearRect(0, 0, css, css);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(210,226,255,0.1)";
      ctx.lineWidth = 18;
      ctx.stroke();

      const start = hourToAngle(this.bed);
      let span = this.wake - this.bed;
      if (span <= 0) span += 24;
      const end = start + (span / 24) * Math.PI * 2;

      ctx.beginPath();
      ctx.arc(cx, cy, r, start, end);
      ctx.strokeStyle = "#8eb0ff";
      ctx.shadowColor = "rgba(120, 160, 255, 0.85)";
      ctx.shadowBlur = 16;
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.shadowBlur = 0;

      for (let h = 0; h < 24; h += 6) {
        const a = hourToAngle(h);
        ctx.fillStyle = "rgba(210,226,255,0.55)";
        ctx.font = "500 11px IBM Plex Mono, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pad(h), cx + Math.cos(a) * (r + 28), cy + Math.sin(a) * (r + 28));
      }

      this.handle(ctx, cx, cy, r, this.bed, "#d7e6ff", "Bed");
      this.handle(ctx, cx, cy, r, this.wake, "#fff4d0", "Wake");

      ctx.fillStyle = "#e8eef8";
      ctx.font = "600 22px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(Store.formatDuration(Math.round(span * 60)), cx, cy - 2);
      ctx.fillStyle = "#8b97ad";
      ctx.font = "500 10px IBM Plex Mono, monospace";
      ctx.fillText("NOCTURNAL ARC", cx, cy + 18);
    },
    handle(ctx, cx, cy, r, hour, color, label) {
      const a = hourToAngle(hour);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(7,9,15,0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(210,226,255,0.7)";
      ctx.font = "500 9px IBM Plex Mono, monospace";
      ctx.fillText(label, x, y - 16);
    },
    posFromEvent(event) {
      const rect = els.ring.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top, size: rect.width };
    },
    hourFromPos(pos) {
      const cx = pos.size / 2;
      const cy = pos.size / 2;
      let ang = Math.atan2(pos.y - cy, pos.x - cx);
      let hours = ((ang + Math.PI / 2) / (Math.PI * 2)) * 24;
      if (hours < 0) hours += 24;
      return hours;
    },
    nearest(hour) {
      const db = Math.min(Math.abs(hour - this.bed), 24 - Math.abs(hour - this.bed));
      const dw = Math.min(Math.abs(hour - this.wake), 24 - Math.abs(hour - this.wake));
      return db <= dw ? "bed" : "wake";
    },
    bind() {
      const start = (event) => {
        const pos = this.posFromEvent(event);
        const hour = this.hourFromPos(pos);
        this.dragging = this.nearest(hour);
        this.applyHour(this.dragging, hour);
        els.ring.setPointerCapture(event.pointerId);
      };
      const move = (event) => {
        if (!this.dragging) return;
        this.applyHour(this.dragging, this.hourFromPos(this.posFromEvent(event)));
      };
      const end = () => {
        this.dragging = null;
      };
      els.ring.addEventListener("pointerdown", start);
      els.ring.addEventListener("pointermove", move);
      els.ring.addEventListener("pointerup", end);
      els.ring.addEventListener("pointercancel", end);
    },
    applyHour(which, hour) {
      const snapped = Math.round(hour * 12) / 12;
      this[which] = (snapped + 24) % 24;
      const bed = hoursToInput(this.bed);
      const wake = hoursToInput(this.wake);
      els.sleepBed.value = bed;
      els.sleepWake.value = wake;
      updateDurationLabel();
      this.draw();
    },
    syncFromInputs() {
      this.bed = inputToHours(els.sleepBed.value);
      this.wake = inputToHours(els.sleepWake.value);
      this.draw();
    }
  };

  function hourToAngle(hour) {
    return -Math.PI / 2 + (hour / 24) * Math.PI * 2;
  }

  function inputToHours(value) {
    const min = Store.parseTime(value);
    return min / 60;
  }

  function hoursToInput(hours) {
    const total = Math.round(((hours + 24) % 24) * 60);
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${pad(h)}:${pad(m)}`;
  }

  function updateDurationLabel() {
    const min = Store.durationMinutes(els.sleepBed.value, els.sleepWake.value);
    els.sleepDuration.textContent = Store.formatDuration(min);
  }

  function todaysMeals() {
    return Store.todayMeals(data, today).sort((a, b) => a.time.localeCompare(b.time));
  }

  function renderMeals() {
    const meals = todaysMeals();
    els.mealCount.textContent = `${meals.length} ${meals.length === 1 ? "item" : "items"}`;
    els.mealList.innerHTML = meals
      .map((m) => {
        const cat = CATS[m.category] || CATS.protein;
        return `<li>
          <span class="swatch" style="background:${cat.color};color:${cat.color}"></span>
          <div>
            <strong>${escapeHtml(m.name)}</strong>
            <small>${escapeHtml(cat.label)}</small>
          </div>
          <div class="end">
            <span class="kcal">${m.calories}</span>
          </div>
        </li>`;
      })
      .join("");
  }

  function renderSleep() {
    const nights = [...data.sleeps].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    els.sleepList.innerHTML = nights
      .map((s) => {
        const pct = Math.min(100, (s.durationMin / (10 * 60)) * 100);
        return `<li>
          <div>
            <strong>${prettyDate(s.date)}</strong>
            <small>${s.bed} → ${s.wake} · q${s.quality}</small>
            <div class="sleep-bar"><i style="width:${pct}%"></i></div>
          </div>
          <div class="end">
            <span class="kcal">${Store.formatDuration(s.durationMin)}</span>
            <button class="x" type="button" data-del-sleep="${s.id}" aria-label="Remove sleep on ${s.date}">×</button>
          </div>
        </li>`;
      })
      .join("");
  }

  function renderStats() {
    const meals = todaysMeals();
    const kcal = meals.reduce((sum, m) => sum + m.calories, 0);
    const night = Store.sleepFor(data, today);
    els.statKcal.textContent = kcal.toLocaleString();
    els.statSleep.textContent = night ? Store.formatDuration(night.durationMin) : "—";
    els.statDate.textContent = prettyDate(today);
    els.hudMass.textContent = kcal.toLocaleString();
    els.donutKcal.textContent = kcal.toLocaleString();
    els.tankFill.style.height = `${Math.max(6, Math.min(82, (kcal / 3600) * 82))}%`;
    els.tankEmpty.classList.toggle("is-off", meals.length > 0);

    const totals = Store.totalsByCategory(meals);
    const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    els.composition.innerHTML = `
      <div class="comp-bar">
        ${Object.keys(CATS)
          .map((k) => `<span class="${k}" style="width:${(totals[k] / sum) * 100}%"></span>`)
          .join("")}
      </div>
      <div class="comp-labels">
        ${Object.keys(CATS)
          .map((k) => {
            const short = { protein: "Protein", carbs: "Carbs", fats: "Fats", produce: "Produce" }[k];
            return `<span>${short} ${Math.round((totals[k] / sum) * 100)}%</span>`;
          })
          .join("")}
      </div>`;
  }

  function renderAll() {
    renderMeals();
    renderSleep();
    renderStats();
    Observatory.update(data, today);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  function tickClock() {
    const d = new Date();
    els.statClock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  els.qualityDots.forEach((btn) => {
    btn.addEventListener("click", () => {
      quality = Number(btn.dataset.q);
      els.qualityDots.forEach((b) => {
        const on = Number(b.dataset.q) <= quality;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", Number(b.dataset.q) === quality ? "true" : "false");
      });
    });
  });

  els.sleepForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = els.sleepDate.value || today;
    const bed = els.sleepBed.value;
    const wake = els.sleepWake.value;
    const entry = {
      id: Store.uid(),
      date,
      bed,
      wake,
      quality,
      durationMin: Store.durationMinutes(bed, wake)
    };
    data.sleeps = data.sleeps.filter((s) => s.date !== date);
    data.sleeps.push(entry);
    persist();
    toast(`Recorded ${Store.formatDuration(entry.durationMin)} nocturnal interval`);
  });

  els.sleepList.addEventListener("click", (event) => {
    const id = event.target.dataset.delSleep;
    if (!id) return;
    data.sleeps = data.sleeps.filter((s) => s.id !== id);
    persist();
  });

  els.sleepBed.addEventListener("input", () => {
    updateDurationLabel();
    SleepRing.syncFromInputs();
  });
  els.sleepWake.addEventListener("input", () => {
    updateDurationLabel();
    SleepRing.syncFromInputs();
  });

  function renderMealOptions() {
    els.mealOptions.innerHTML = Object.values(Store.MEALS)
      .map((spec) => {
        const on = spec.id === data.protocol ? " is-on" : "";
        const pressed = spec.id === data.protocol ? "true" : "false";
        return `<button type="button" class="meal-card${on}" data-protocol="${spec.id}" aria-pressed="${pressed}">
          <span class="protocol-kicker"><span>${escapeHtml(spec.kicker)}</span><span>${Store.kcalOf(spec).toLocaleString()} kcal</span></span>
          <strong>${escapeHtml(spec.label)}</strong>
          <p class="ingredients">${escapeHtml(Store.ingredientLine(spec))}</p>
        </button>`;
      })
      .join("");
  }

  function syncProtocolUi() {
    const spec = Store.MEALS[data.protocol] || Store.MEALS.chlorophyll;
    renderMealOptions();
    els.verdict.textContent = spec.blurb;
    els.statProtocol.textContent = spec.label;
    els.tankLabel.textContent = `Caloric field · ${spec.label}`;
    els.tankStage.classList.toggle("is-poor", spec.tone === "poor");
    els.tankStage.classList.toggle("is-balanced", spec.tone === "balanced");
    els.tankStage.classList.toggle("is-walk", spec.tone === "walk");
    const night = Store.sleepFor(data, today);
    if (night) {
      els.sleepBed.value = night.bed;
      els.sleepWake.value = night.wake;
      quality = night.quality;
      els.qualityDots.forEach((b) => {
        const q = Number(b.dataset.q);
        b.classList.toggle("is-on", q <= quality);
        b.setAttribute("aria-pressed", q === quality ? "true" : "false");
      });
      updateDurationLabel();
      SleepRing.syncFromInputs();
    }
  }

  function loadProtocol(id) {
    data = Store.applyProtocol(data, id);
    syncProtocolUi();
    SpecimenTank.loadMeals(todaysMeals());
    persist();
    toast(`${Store.MEALS[id].label} loaded into the tank`);
  }

  els.mealOptions.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-protocol]");
    if (!btn) return;
    loadProtocol(btn.dataset.protocol);
  });

  els.reset.addEventListener("click", () => {
    data = Store.reset();
    syncProtocolUi();
    SpecimenTank.loadMeals(todaysMeals());
    persist();
    toast("Demo restored to Chlorophyll Club");
  });

  function initDefaults() {
    els.sleepDate.value = today;
    const night = Store.sleepFor(data, today);
    els.sleepBed.value = night ? night.bed : "23:10";
    els.sleepWake.value = night ? night.wake : "06:50";
    quality = night ? night.quality : 4;
    els.qualityDots.forEach((b) => {
      const q = Number(b.dataset.q);
      b.classList.toggle("is-on", q <= quality);
    });
    updateDurationLabel();
    SleepRing.syncFromInputs();
  }

  SpecimenTank.boot(document.getElementById("tank-stage"), (count) => {
    els.hudParticles.textContent = String(count);
  });
  Observatory.boot();
  initDefaults();
  syncProtocolUi();
  SleepRing.bind();
  renderAll();
  SpecimenTank.loadMeals(todaysMeals());
  tickClock();
  setInterval(tickClock, 1000);
  window.addEventListener("resize", () => SleepRing.draw());
})();
