(function () {
  const defaultConfig = {
    backgroundStart: "#0061d2",
    backgroundEnd: "#000026",
    gradientTopLeft: "#0061d2",
    gradientTopRight: "#000026",
    gradientBottomLeft: "#003b8f",
    gradientBottomRight: "#000026",
    gradientOpacity: 100,
    backgroundImage: "",
    cardCount: 34,
    cardMin: 8,
    cardMax: 72,
    speed: 1,
    brightness: 1.08,
    filamentDensity: 1,
    looseFilaments: 1,
    cardScale: 1,
    cardDepth: 1,
    clusters: [
      { code: "GRO", name: "Growth", lane: 0.18, tone: 0.78 },
      { code: "EFF", name: "Efficiency", lane: 0.30, tone: 0.58 },
      { code: "RSK", name: "Risk", lane: 0.43, tone: 0.42 },
      { code: "EXP", name: "Experience", lane: 0.56, tone: 0.68 },
      { code: "CAP", name: "Capacity", lane: 0.68, tone: 0.18 },
      { code: "VAL", name: "Value", lane: 0.78, tone: 0.50 }
    ],
    cards: [
      { title: "Growth Portfolio", owner: "PMO", stage: "SCORED", rag: "GREEN", score: 88, businessValue: 9.8, funding: 4.2, readiness: 79, alignment: "GROWTH", capacity: 18, risk: "MED", benefits: 68 },
      { title: "Margin Program", owner: "FIN", stage: "FUNDED", rag: "AMBER", score: 82, businessValue: 7.4, funding: 3.1, readiness: 72, alignment: "MARGIN", capacity: 14, risk: "MED", benefits: 61 },
      { title: "Customer Trust", owner: "RISK", stage: "ACTIVE", rag: "GREEN", score: 91, businessValue: 6.6, funding: 2.8, readiness: 86, alignment: "RISK", capacity: 12, risk: "LOW", benefits: 74 },
      { title: "Experience Uplift", owner: "CX", stage: "GATE", rag: "AMBER", score: 76, businessValue: 5.9, funding: 2.4, readiness: 64, alignment: "CX", capacity: 16, risk: "MED", benefits: 57 },
      { title: "Capacity Plan", owner: "OPS", stage: "INTAKE", rag: "GREEN", score: 79, businessValue: 4.7, funding: 1.9, readiness: 69, alignment: "SCALE", capacity: 22, risk: "LOW", benefits: 59 },
      { title: "Benefits Office", owner: "PMO", stage: "BENEFITS", rag: "GREEN", score: 86, businessValue: 8.2, funding: 1.6, readiness: 88, alignment: "VALUE", capacity: 9, risk: "LOW", benefits: 81 }
    ],
    metricRows: [
      ["SCORE", "OWNER", "BV", "FUND", "DEC", "READY"],
      ["STAGE", "RAG", "ALIGN", "CAP", "DEP", "BEN"],
      ["SCORE", "PRIOR", "ROI", "RISK", "GATE", "MILE"],
      ["STAGE", "BV", "FUND", "DEC", "FORE", "OUT"]
    ]
  };

  const copyConfig = (config) => JSON.parse(JSON.stringify(config));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const cycle = (value) => ((value % 1) + 1) % 1;
  const hexToRgb = (hex) => {
    const normalized = String(hex || "").replace("#", "").trim();
    if (!/^[0-9a-f]{6}$/i.test(normalized)) return { r: 0, g: 0, b: 38 };
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  };
  const colorAlpha = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };
  const seeded = (index) => {
    const x = Math.sin(index * 999.13) * 10000;
    return x - Math.floor(x);
  };
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCoreDevice = (navigator.hardwareConcurrency || 8) <= 4;
  const lowPowerMode = coarsePointer || lowCoreDevice;

  const mergeConfig = (base, next) => {
    const merged = { ...copyConfig(base), ...(next || {}) };
    merged.gradientTopLeft = merged.gradientTopLeft || merged.backgroundStart || defaultConfig.gradientTopLeft;
    merged.gradientTopRight = merged.gradientTopRight || merged.backgroundEnd || defaultConfig.gradientTopRight;
    merged.gradientBottomLeft = merged.gradientBottomLeft || merged.backgroundStart || defaultConfig.gradientBottomLeft;
    merged.gradientBottomRight = merged.gradientBottomRight || merged.backgroundEnd || defaultConfig.gradientBottomRight;
    merged.backgroundStart = merged.gradientTopLeft;
    merged.backgroundEnd = merged.gradientTopRight;
    merged.gradientOpacity = clamp(Number(merged.gradientOpacity ?? 100), 0, 100);
    merged.backgroundImage = String(merged.backgroundImage || "").trim();
    merged.cardMin = clamp(Number(merged.cardMin) || defaultConfig.cardMin, 1, 144);
    merged.cardMax = clamp(Number(merged.cardMax) || defaultConfig.cardMax, merged.cardMin, 160);
    merged.cardCount = clamp(Number(merged.cardCount) || defaultConfig.cardCount, merged.cardMin, merged.cardMax);
    merged.speed = clamp(Number(merged.speed) || defaultConfig.speed, 0.1, 3);
    merged.brightness = clamp(Number(merged.brightness) || defaultConfig.brightness, 0.4, 2);
    merged.filamentDensity = clamp(Number(merged.filamentDensity) || defaultConfig.filamentDensity, 0, 2);
    merged.looseFilaments = clamp(Number(merged.looseFilaments) || 0, 0, 2);
    merged.cardScale = clamp(Number(merged.cardScale) || defaultConfig.cardScale, 0.5, 1.75);
    merged.cardDepth = clamp(Number(merged.cardDepth ?? defaultConfig.cardDepth), 0, 1.75);
    merged.clusters = Array.isArray(merged.clusters) && merged.clusters.length ? merged.clusters : copyConfig(defaultConfig.clusters);
    merged.cards = Array.isArray(merged.cards) && merged.cards.length ? merged.cards : copyConfig(defaultConfig.cards);
    merged.metricRows = Array.isArray(merged.metricRows) && merged.metricRows.length ? merged.metricRows : copyConfig(defaultConfig.metricRows);
    return merged;
  };

  class SignalField {
    constructor(host, config) {
      this.host = host;
      this.config = mergeConfig(defaultConfig, config);
      this.canvas = document.createElement("canvas");
      this.canvas.className = "signal-field-canvas";
      this.ctx = this.canvas.getContext("2d");
      this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.frame = 0;
      this.lastDraw = 0;
      this.paused = false;
      this.destroyed = false;
      this.state = {
        width: 1,
        height: 1,
        dpr: 1,
        pointerX: 0,
        pointerY: 0,
        targetX: 0,
        targetY: 0,
        start: performance.now(),
        modules: []
      };
      this.resize = this.resize.bind(this);
      this.draw = this.draw.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.host.innerHTML = "";
      this.host.appendChild(this.canvas);
      this.applyBackground();
      this.resize();
      this.resume();
      window.addEventListener("resize", this.resize);
      this.host.addEventListener("pointermove", this.onPointerMove, { passive: true });
    }

    updateConfig(config) {
      this.config = mergeConfig(this.config, config);
      this.applyBackground();
      this.buildModules();
    }

    exportConfig() {
      return copyConfig(this.config);
    }

    destroy() {
      this.destroyed = true;
      this.pause();
      window.removeEventListener("resize", this.resize);
      this.host.removeEventListener("pointermove", this.onPointerMove);
      this.canvas.remove();
    }

    pause() {
      this.paused = true;
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }

    resume() {
      if (this.destroyed) return;
      this.paused = false;
      if (!this.frame) this.frame = requestAnimationFrame(this.draw);
    }

    frameInterval() {
      if (this.reduceMotion) return 220;
      if (lowPowerMode || this.compact()) return 66;
      return 38;
    }

    compact() {
      return window.matchMedia("(max-width: 860px)").matches || coarsePointer;
    }

    applyBackground() {
      const opacity = this.config.gradientOpacity / 100;
      const layers = [
        `radial-gradient(circle at top left, ${colorAlpha(this.config.gradientTopLeft, opacity)} 0%, ${colorAlpha(this.config.gradientTopLeft, 0)} 58%)`,
        `radial-gradient(circle at top right, ${colorAlpha(this.config.gradientTopRight, opacity)} 0%, ${colorAlpha(this.config.gradientTopRight, 0)} 58%)`,
        `radial-gradient(circle at bottom left, ${colorAlpha(this.config.gradientBottomLeft, opacity)} 0%, ${colorAlpha(this.config.gradientBottomLeft, 0)} 62%)`,
        `radial-gradient(circle at bottom right, ${colorAlpha(this.config.gradientBottomRight, opacity)} 0%, ${colorAlpha(this.config.gradientBottomRight, 0)} 62%)`,
        `linear-gradient(135deg, ${colorAlpha(this.config.gradientTopLeft, opacity)} 0%, ${colorAlpha(this.config.gradientBottomRight, opacity)} 100%)`
      ];
      if (this.config.backgroundImage) {
        layers.push(`url("${this.config.backgroundImage.replace(/"/g, "%22")}") center / cover no-repeat`);
      }
      this.host.style.background = layers.join(", ");
    }

    resize() {
      const rect = this.host.getBoundingClientRect();
      this.state.width = Math.max(1, rect.width);
      this.state.height = Math.max(1, rect.height);
      this.state.dpr = Math.min(window.devicePixelRatio || 1, lowPowerMode || this.compact() ? 1 : 1.2);
      this.canvas.width = Math.round(this.state.width * this.state.dpr);
      this.canvas.height = Math.round(this.state.height * this.state.dpr);
      this.canvas.style.width = `${this.state.width}px`;
      this.canvas.style.height = `${this.state.height}px`;
      this.ctx.setTransform(this.state.dpr, 0, 0, this.state.dpr, 0, 0);
      this.buildModules();
    }

    buildModules() {
      const clusters = this.config.clusters;
      const cards = this.config.cards;
      const rows = this.config.metricRows;
      const compactScale = this.compact() ? 0.58 : 1;
      const qualityScale = lowPowerMode ? 0.72 : 1;
      const count = Math.max(8, Math.round(this.config.cardCount * compactScale * qualityScale));
      this.state.modules = Array.from({ length: count }, (_, index) => {
        const cluster = clusters[index % clusters.length];
        const card = cards[index % cards.length];
        const depthSpread = 0.58 + seeded(index + 4) * 0.72;
        const depth = mix(0.9, depthSpread, this.config.cardDepth) * this.config.cardScale;
        const width = (132 + seeded(index + 8) * 86) * depth;
        const height = (82 + seeded(index + 11) * 34) * depth;
        return {
          id: index,
          code: `${cluster.code || "SIG"}-${String(120 + index * 7).padStart(3, "0")}`,
          title: card.title || "Portfolio Initiative",
          cluster,
          dependencyCluster: clusters[(index + 2 + Math.floor(seeded(index + 9) * 2)) % clusters.length].code,
          baseX: seeded(index + 1),
          y: this.state.height * ((cluster.lane ?? cluster.y ?? 0.5) + (seeded(index + 2) - 0.5) * 0.08),
          width,
          height,
          depth,
          speed: ((0.010 + seeded(index + 3) * 0.014) / Math.max(0.5, depth)) * this.config.speed,
          phase: seeded(index + 5),
          tone: cluster.tone ?? seeded(index + 6),
          rows: rows[index % rows.length],
          metrics: this.buildMetrics(card, index)
        };
      });
    }

    buildMetrics(card, index) {
      const score = Number(card.score ?? Math.round(58 + seeded(index + 20) * 36));
      const funding = Number(card.funding ?? (0.8 + seeded(index + 13) * 7.8).toFixed(1));
      const value = Number(card.businessValue ?? card.value ?? (1.2 + seeded(index + 14) * 12.5).toFixed(1));
      const readiness = Number(card.readiness ?? Math.round(48 + seeded(index + 18) * 42));
      const benefits = Number(card.benefits ?? Math.round(44 + seeded(index + 26) * 44));
      return {
        stage: card.stage || ["INTAKE", "SCORED", "FUNDED", "ACTIVE", "GATE", "BENEFITS"][Math.floor(seeded(index + 21) * 6)],
        rag: card.rag || ["GREEN", "GREEN", "AMBER", "AMBER", "RED"][Math.floor(seeded(index + 22) * 5)],
        owner: card.owner || ["PMO", "OPS", "FIN", "CX", "RISK", "DATA"][Math.floor(seeded(index + 23) * 6)],
        priority: card.priority || `P${Math.max(1, Math.min(4, Math.ceil(seeded(index + 24) * 4)))}`,
        funding,
        value,
        deps: Number(card.dependencies ?? Math.max(1, Math.round(seeded(index + 15) * 8))),
        decisions: Number(card.decisions ?? Math.max(0, Math.round(seeded(index + 16) * 4))),
        readiness,
        forecast: Number(card.forecast ?? Math.round(55 + seeded(index + 19) * 34)),
        milestone: card.milestone || `D+${Math.round(8 + seeded(index + 25) * 52)}`,
        benefit: `${benefits}%`,
        score,
        roi: Number(card.roi ?? (value / Math.max(0.8, funding)).toFixed(1)),
        capacity: Number(card.capacity ?? Math.round(6 + seeded(index + 31) * 34)),
        risk: card.risk || ["LOW", "MED", "MED", "HIGH"][Math.floor(seeded(index + 27) * 4)],
        alignment: card.alignment || ["GROWTH", "MARGIN", "RISK", "CX", "SCALE", "VALUE"][Math.floor(seeded(index + 28) * 6)]
      };
    }

    modulePosition(module, time) {
      const travel = this.state.width + module.width + 120;
      const progress = cycle(module.baseX + time * module.speed);
      const x = -module.width - 70 + progress * travel;
      const y = module.y
        + Math.sin(time * 0.22 + module.phase * Math.PI * 2) * 18 * module.depth
        + this.state.pointerY * 22 * module.depth;
      return {
        x: x + this.state.pointerX * 28 * module.depth,
        y
      };
    }

    roundRect(x, y, w, h, r = 8) {
      const ctx = this.ctx;
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }

    drawAtmosphere(time) {
      const ctx = this.ctx;
      const b = this.config.brightness;
      const glowX = this.state.width * (0.62 + this.state.pointerX * 0.18);
      const glowY = this.state.height * (0.42 + this.state.pointerY * 0.14);
      const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(260, this.state.width * 0.34));
      glow.addColorStop(0, `rgba(64, 225, 248, ${0.24 * b})`);
      glow.addColorStop(0.38, `rgba(55, 142, 246, ${0.12 * b})`);
      glow.addColorStop(1, "rgba(39, 124, 236, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, this.state.width, this.state.height);
      ctx.save();
      ctx.translate(this.state.pointerX * 18, this.state.pointerY * 10);
      for (let i = 0; i < (lowPowerMode ? 6 : 10); i += 1) {
        const y = this.state.height * (0.08 + i * 0.10) + Math.sin(time * 0.25 + i) * 7;
        ctx.beginPath();
        ctx.moveTo(-40, y);
        ctx.lineTo(this.state.width + 40, y + Math.sin(i * 1.4) * 28);
        ctx.strokeStyle = `rgba(145, 232, 255, ${0.08 * b})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    drawFilaments(visible, time) {
      const ctx = this.ctx;
      const maxDistance = this.compact() ? 220 : 340;
      const density = this.config.filamentDensity;
      const step = lowPowerMode ? 2 : 1;
      for (let i = 0; i < visible.length; i += step) {
        for (let j = i + 1; j < visible.length; j += step) {
          const a = visible[i];
          const b = visible[j];
          const sameCluster = a.module.cluster.code === b.module.cluster.code;
          const dependencyLink = a.module.dependencyCluster === b.module.cluster.code || b.module.dependencyCluster === a.module.cluster.code;
          if (!sameCluster && !dependencyLink) continue;
          const ax = a.x + a.module.width * 0.52;
          const ay = a.y + a.module.height * 0.52;
          const bx = b.x + b.module.width * 0.48;
          const by = b.y + b.module.height * 0.48;
          const distance = Math.hypot(ax - bx, ay - by);
          const gate = Math.sin(time * 0.7 + a.module.id * 1.7 + b.module.id * 0.9);
          if (distance > maxDistance || gate < (sameCluster ? -0.28 + density * 0.10 : -0.04 + density * 0.08)) continue;
          const baseOpacity = (sameCluster ? 0.31 : 0.42) * density * this.config.brightness;
          const opacity = Math.min(baseOpacity + 0.08, (1 - distance / maxDistance) * (baseOpacity + 0.16)) * (0.76 + gate * 0.28);
          const midX = (ax + bx) / 2 + Math.sin(time * 0.34 + i) * 18;
          const midY = (ay + by) / 2 + Math.cos(time * 0.31 + j) * 12;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.quadraticCurveTo(midX, midY, bx, by);
          ctx.strokeStyle = dependencyLink ? `rgba(238, 188, 91, ${opacity})` : `rgba(111, 224, 248, ${opacity})`;
          ctx.lineWidth = Math.max(0.7, (dependencyLink ? 1.7 : 1.2) * Math.min(a.module.depth, b.module.depth));
          ctx.stroke();
        }
      }
    }

    drawLooseFilaments(visible, time) {
      if (visible.length < 2 || this.config.looseFilaments <= 0) return;
      const ctx = this.ctx;
      for (const entry of visible) {
        const module = entry.module;
        if (module.id % Math.max(lowPowerMode ? 4 : 2, Math.round(4 - this.config.looseFilaments)) !== 0) continue;
        const target = visible.find((candidate) =>
          candidate.module.cluster.code === module.dependencyCluster &&
          Math.abs(candidate.module.id - module.id) > 2
        );
        if (!target) continue;
        const progress = cycle(time * 0.12 + module.phase);
        if (progress > 0.96) continue;
        const startX = entry.x + module.width * 0.88;
        const startY = entry.y + module.height * 0.50;
        const targetX = target.x + target.module.width * 0.12;
        const targetY = target.y + target.module.height * 0.52;
        const attach = clamp((progress - 0.68) / 0.22, 0, 1);
        const early = clamp(progress / 0.68, 0, 1);
        const reach = progress < 0.68 ? 0.22 + early * 0.42 : 0.64 + attach * 0.36;
        const dotX = mix(startX, targetX, reach) + Math.sin(time * 1.7 + module.id) * (1 - attach) * 18;
        const dotY = mix(startY, targetY, reach) + Math.cos(time * 1.3 + module.id) * (1 - attach) * 12;
        const glow = (progress < 0.68 ? 0.34 + early * 0.18 : 0.52 + attach * 0.38) * this.config.brightness;
        const fade = progress > 0.90 ? 1 - (progress - 0.90) / 0.06 : 1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, fade);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo((startX + dotX) / 2 + Math.sin(time + module.id) * 18, (startY + dotY) / 2 + Math.cos(time * 0.8 + module.id) * 10, dotX, dotY);
        ctx.strokeStyle = `rgba(168, 242, 255, ${0.32 + glow * 0.30})`;
        ctx.lineWidth = 1.2 + attach * 1.1;
        ctx.stroke();
        const radius = 2.8 + attach * 4.2;
        const gradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, radius * 5.5);
        gradient.addColorStop(0, `rgba(235, 254, 255, ${0.98 * glow})`);
        gradient.addColorStop(0.35, `rgba(93, 232, 255, ${0.58 * glow})`);
        gradient.addColorStop(1, "rgba(79, 224, 248, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(dotX, dotY, radius * 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(240, 254, 255, ${0.88 * glow})`;
        ctx.beginPath();
        ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
        ctx.fill();
        if (attach > 0.78) {
          ctx.beginPath();
          ctx.moveTo(dotX, dotY);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = `rgba(248, 204, 108, ${0.56 * attach})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    metricValue(label, module, rowIndex, time) {
      const metrics = module.metrics;
      const drift = cycle(time * 0.055 + module.phase + rowIndex * 0.08);
      if (label === "STAGE") return metrics.stage;
      if (label === "RAG") return metrics.rag;
      if (label === "OWNER") return metrics.owner;
      if (label === "PRIOR") return metrics.priority;
      if (label === "SCORE") return `${Math.round(metrics.score + drift * 2)}/100`;
      if (label === "FUND" || label === "COST" || label === "BUD") return `$${metrics.funding.toFixed(1)}M`;
      if (label === "BV" || label === "VALUE") return `$${metrics.value.toFixed(1)}M`;
      if (label === "DEP") return `${String(metrics.deps).padStart(2, "0")} ${module.dependencyCluster}`;
      if (label === "DEC") return `${metrics.decisions} DUE`;
      if (label === "READY") return `${Math.round(metrics.readiness + drift * 5)}%`;
      if (label === "FORE" || label === "OUT") return `${Math.round(metrics.forecast + drift * 4)}%`;
      if (label === "MILE") return metrics.milestone;
      if (label === "BEN") return metrics.benefit;
      if (label === "ROI") return `${metrics.roi.toFixed(1)}X`;
      if (label === "CAP") return `${metrics.capacity} FTE`;
      if (label === "RISK") return metrics.risk;
      if (label === "ALIGN") return metrics.alignment;
      if (label === "GATE") return metrics.stage === "GATE" ? "OPEN" : "NEXT";
      return "";
    }

    drawText(module, x, y, time) {
      const ctx = this.ctx;
      const alpha = clamp((0.52 + module.depth * 0.32) * this.config.brightness, 0.34, 0.96);
      const lineH = Math.max(9, (module.height - 22 * module.depth) / (module.rows.length + 1));
      const fontSize = Math.max(7, Math.round(8 * module.depth));
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(237, 253, 255, ${Math.min(0.96, alpha + 0.18)})`;
      ctx.fillText(module.code, x + 10 * module.depth, y + 12 * module.depth);
      ctx.fillStyle = `rgba(188, 237, 248, ${Math.min(0.86, alpha + 0.06)})`;
      ctx.fillText(module.title.toUpperCase().slice(0, 18), x + 10 * module.depth, y + 23 * module.depth);
      for (let i = 0; i < module.rows.length; i += 1) {
        const label = module.rows[i];
        const value = this.metricValue(label, module, i, time);
        ctx.fillStyle = `rgba(214, 252, 255, ${Math.min(0.92, alpha)})`;
        ctx.fillText(`${label}:${value}`.slice(0, 18), x + 10 * module.depth, y + 24 * module.depth + lineH * (i + 1));
        const barW = (module.width - 22 * module.depth) * (0.22 + seeded(module.id + i * 10) * 0.55);
        ctx.fillStyle = `rgba(68, 226, 248, ${0.18 + alpha * 0.28})`;
        ctx.fillRect(x + 10 * module.depth, y + 24 * module.depth + lineH * (i + 1) + 5, barW, Math.max(1, 1.2 * module.depth));
      }
    }

    drawModule(entry, time) {
      const ctx = this.ctx;
      const { module, x, y } = entry;
      const cyan = module.tone > 0.66;
      const gold = module.tone < 0.24;
      const edgeColor = gold ? "rgba(238, 188, 91," : cyan ? "rgba(67, 226, 249," : "rgba(118, 168, 255,";
      const fill = gold ? `rgba(62, 50, 24, ${0.30 + module.depth * 0.18})` : `rgba(12, 76, 119, ${0.30 + module.depth * 0.20})`;
      ctx.save();
      ctx.globalAlpha = clamp((0.68 + module.depth * 0.32) * this.config.brightness, 0.4, 1);
      ctx.shadowBlur = 26 * module.depth;
      ctx.shadowColor = gold ? "rgba(248, 196, 90, 0.56)" : "rgba(54, 225, 248, 0.64)";
      this.roundRect(x, y, module.width, module.height, 10 * module.depth);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = `${edgeColor} ${0.38 + module.depth * 0.22})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = module.metrics.rag === "RED" ? "rgba(246, 124, 124, 0.72)" : module.metrics.rag === "AMBER" ? "rgba(248, 204, 108, 0.76)" : "rgba(118, 230, 184, 0.68)";
      ctx.fillRect(x, y, Math.max(3, 4 * module.depth), module.height);
      ctx.shadowBlur = 0;
      this.drawText(module, x, y, time);
      ctx.restore();
      const pulse = 0.45 + Math.sin(time * 1.3 + module.phase * 6.28) * 0.25;
      ctx.beginPath();
      ctx.arc(x + module.width * 0.88, y + module.height * 0.20, 2.5 * module.depth, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(154, 246, 255, ${pulse * 0.94 * this.config.brightness})`;
      ctx.fill();
    }

    draw(now = performance.now()) {
      if (this.paused || this.destroyed) return;
      if (now - this.lastDraw < this.frameInterval()) {
        this.frame = requestAnimationFrame(this.draw);
        return;
      }
      this.lastDraw = now;
      const rawTime = (now - this.state.start) / 1000;
      const time = this.reduceMotion ? rawTime * 0.16 : rawTime;
      this.state.pointerX = mix(this.state.pointerX, this.state.targetX, 0.05);
      this.state.pointerY = mix(this.state.pointerY, this.state.targetY, 0.05);
      this.ctx.clearRect(0, 0, this.state.width, this.state.height);
      this.drawAtmosphere(time);
      const visible = this.state.modules
        .map((module) => ({ module, ...this.modulePosition(module, time) }))
        .filter((entry) => entry.x > -entry.module.width - 80 && entry.x < this.state.width + 100)
        .sort((a, b) => a.module.depth - b.module.depth);
      this.drawLooseFilaments(visible, time);
      this.drawFilaments(visible, time);
      for (const entry of visible) this.drawModule(entry, time);
      this.frame = requestAnimationFrame(this.draw);
    }

    onPointerMove(event) {
      const rect = this.host.getBoundingClientRect();
      this.state.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      this.state.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }
  }

  window.PortfolioSignalField = {
    defaultConfig: copyConfig(defaultConfig),
    create(host, config) {
      if (!host) throw new Error("PortfolioSignalField requires a host element.");
      return new SignalField(host, config);
    }
  };
}());
