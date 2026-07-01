(() => {
  "use strict";

  const qs = new URLSearchParams(window.location.search);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCoreDevice = (navigator.hardwareConcurrency || 8) <= 4;
  const lowPowerMode = reducedMotion || coarsePointer || lowCoreDevice;

  const BANNERS = [
    {
      id: "signal",
      type: "signal",
      label: "Portfolio signal",
      eyebrow: "Portfolio operating signal",
      title: "Initiatives moving toward decision-ready value.",
      description: "Synthetic portfolio cards, dependency filaments, and review signals for PMO, portfolio, and operating-model hero banners.",
      tags: ["Cards", "Filaments", "JSON export"],
      settings: {
        cardCount: 34,
        speed: 1,
        brightness: 1.08,
        filamentDensity: 1,
        looseFilaments: 1,
        cardScale: 1,
        cardDepth: 1,
        gradientTopLeft: "#0061d2",
        gradientTopRight: "#000026",
        gradientBottomLeft: "#003b8f",
        gradientBottomRight: "#000026"
      },
      controls: [
        { key: "cardCount", label: "Cards", type: "range", min: 12, max: 56, step: 1 },
        { key: "speed", label: "Speed", type: "range", min: 0.35, max: 1.85, step: 0.05 },
        { key: "brightness", label: "Brightness", type: "range", min: 0.65, max: 1.55, step: 0.05 },
        { key: "filamentDensity", label: "Filament density", type: "range", min: 0.25, max: 1.65, step: 0.05 },
        { key: "looseFilaments", label: "Connection events", type: "range", min: 0, max: 1.8, step: 0.05 },
        { key: "cardScale", label: "Card scale", type: "range", min: 0.75, max: 1.35, step: 0.05 },
        { key: "cardDepth", label: "Layer depth", type: "range", min: 0, max: 1.75, step: 0.05 },
        { key: "gradientTopLeft", label: "Top left", type: "color" },
        { key: "gradientTopRight", label: "Top right", type: "color" },
        { key: "gradientBottomLeft", label: "Bottom left", type: "color" },
        { key: "gradientBottomRight", label: "Bottom right", type: "color" }
      ]
    },
    {
      id: "decision-gates",
      type: "decision",
      label: "Decision gates",
      eyebrow: "Signal, capacity, delivery readiness",
      title: "Control the work before it controls you.",
      description: "A dark LLM-inspired gate field for decision, governance, model-routing, and AI workflow pages.",
      tags: ["Gate columns", "Attraction field", "Sticky parallax"],
      settings: {
        gateCount: 9,
        filamentDensity: 1.35,
        speed: 1,
        glow: 1.55,
        attraction: 1,
        labelDensity: 0.86,
        accent: "#9bdfff",
        hotAccent: "#ff7065"
      },
      controls: [
        { key: "gateCount", label: "Gate columns", type: "range", min: 6, max: 11, step: 1 },
        { key: "filamentDensity", label: "Filament density", type: "range", min: 0.45, max: 1.65, step: 0.05 },
        { key: "speed", label: "Speed", type: "range", min: 0.35, max: 1.75, step: 0.05 },
        { key: "glow", label: "Glow", type: "range", min: 0.35, max: 2.1, step: 0.05 },
        { key: "attraction", label: "Mouse attraction", type: "range", min: 0, max: 1.45, step: 0.05 },
        { key: "labelDensity", label: "Label density", type: "range", min: 0, max: 1, step: 0.05 },
        { key: "accent", label: "Cool accent", type: "color" },
        { key: "hotAccent", label: "Hot accent", type: "color" }
      ]
    },
    {
      id: "filament-network",
      type: "network",
      label: "Filament network",
      eyebrow: "Career signal, not noise",
      title: "Make moving evidence visible.",
      description: "A full-screen blue filament field for data, search, signal-discovery, and career-tool hero banners.",
      tags: ["Nodes", "Numeric haze", "Network hover"],
      settings: {
        density: 1,
        speed: 1,
        connectionReach: 1,
        glow: 1,
        labelDensity: 0.62,
        clusterSpread: 1,
        backgroundTop: "#031b42",
        backgroundBottom: "#031537",
        accent: "#20baff"
      },
      controls: [
        { key: "density", label: "Node density", type: "range", min: 0.45, max: 1.5, step: 0.05 },
        { key: "speed", label: "Speed", type: "range", min: 0.25, max: 1.8, step: 0.05 },
        { key: "connectionReach", label: "Connection reach", type: "range", min: 0.5, max: 1.6, step: 0.05 },
        { key: "glow", label: "Glow", type: "range", min: 0.45, max: 1.6, step: 0.05 },
        { key: "labelDensity", label: "Number labels", type: "range", min: 0, max: 1, step: 0.05 },
        { key: "clusterSpread", label: "Cluster spread", type: "range", min: 0.65, max: 1.45, step: 0.05 },
        { key: "backgroundTop", label: "Top color", type: "color" },
        { key: "backgroundBottom", label: "Bottom color", type: "color" },
        { key: "accent", label: "Accent", type: "color" }
      ]
    }
  ];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const cycle = (value) => ((value % 1) + 1) % 1;
  const ease = (u) => u * u * (3 - 2 * u);
  const hexToRgb = (hex) => {
    const clean = String(hex || "").replace("#", "").trim();
    if (!/^[0-9a-f]{6}$/i.test(clean)) return { r: 255, g: 255, b: 255 };
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  };
  const rgba = (hex, alpha) => {
    const color = hexToRgb(hex);
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  };
  const seeded = (index) => {
    const x = Math.sin(index * 921.17 + 18.31) * 10000;
    return x - Math.floor(x);
  };

  class CanvasRenderer {
    constructor(root, settings) {
      this.root = root;
      this.settings = { ...settings };
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d", { alpha: true });
      this.root.appendChild(this.canvas);
      this.w = 1;
      this.h = 1;
      this.dpr = 1;
      this.raf = 0;
      this.last = 0;
      this.paused = false;
      this.destroyed = false;
      this.pointer = { x: 0, y: 0, active: false, tx: 0, ty: 0 };
      this.resize = this.resize.bind(this);
      this.frame = this.frame.bind(this);
      this.onMove = this.onMove.bind(this);
      this.onLeave = this.onLeave.bind(this);
      this.root.addEventListener("pointermove", this.onMove, { passive: true });
      this.root.addEventListener("pointerenter", this.onMove, { passive: true });
      this.root.addEventListener("pointerleave", this.onLeave, { passive: true });
      window.addEventListener("resize", this.resize);
      this.resize();
      this.resume();
    }

    update(settings) {
      this.settings = { ...this.settings, ...settings };
      this.rebuild();
    }

    destroy() {
      this.destroyed = true;
      this.pause();
      window.removeEventListener("resize", this.resize);
      this.root.removeEventListener("pointermove", this.onMove);
      this.root.removeEventListener("pointerenter", this.onMove);
      this.root.removeEventListener("pointerleave", this.onLeave);
      this.canvas.remove();
    }

    pause() {
      this.paused = true;
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    resume() {
      if (this.destroyed) return;
      this.paused = false;
      if (!this.raf) this.raf = requestAnimationFrame(this.frame);
    }

    frameInterval() {
      if (reducedMotion) return 220;
      if (lowPowerMode || this.w < 1080) return 66;
      return this.w < 760 ? 50 : 36;
    }

    resize() {
      const rect = this.root.getBoundingClientRect();
      this.w = Math.max(320, Math.floor(rect.width));
      this.h = Math.max(420, Math.floor(rect.height));
      const dprCap = lowPowerMode || this.w < 1080 ? 1 : 1.15;
      this.dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      this.canvas.width = Math.round(this.w * this.dpr);
      this.canvas.height = Math.round(this.h * this.dpr);
      this.canvas.style.width = `${this.w}px`;
      this.canvas.style.height = `${this.h}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.rebuild();
    }

    onMove(event) {
      const rect = this.root.getBoundingClientRect();
      this.pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      this.pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      this.pointer.active = true;
    }

    onLeave() {
      this.pointer.active = false;
      this.pointer.tx = 0;
      this.pointer.ty = 0;
    }

    frame(now) {
      if (this.paused || this.destroyed) return;
      const minFrame = this.frameInterval();
      if (now - this.last >= minFrame) {
        this.last = now;
        this.pointer.x = lerp(this.pointer.x, this.pointer.active ? this.pointer.tx : 0, 0.06);
        this.pointer.y = lerp(this.pointer.y, this.pointer.active ? this.pointer.ty : 0, 0.06);
        this.draw(now / 1000);
      }
      this.raf = requestAnimationFrame(this.frame);
    }

    rebuild() {}
    draw() {}
  }

  class SignalRenderer {
    constructor(root, settings) {
      this.root = root;
      this.settings = { ...settings };
      this.host = document.createElement("div");
      this.host.className = "signal-field-host";
      this.root.appendChild(this.host);
      this.instance = null;
      this.mount();
    }

    mount() {
      if (!window.PortfolioSignalField) return;
      this.instance = window.PortfolioSignalField.create(this.host, this.config());
    }

    config() {
      return {
        ...this.settings,
        cardMin: 8,
        cardMax: 72
      };
    }

    update(settings) {
      this.settings = { ...this.settings, ...settings };
      if (this.instance) this.instance.updateConfig(this.config());
    }

    pause() {
      if (this.instance?.pause) this.instance.pause();
    }

    resume() {
      if (this.instance?.resume) this.instance.resume();
    }

    destroy() {
      if (this.instance) this.instance.destroy();
      this.host.remove();
    }
  }

  class DecisionRenderer extends CanvasRenderer {
    rebuild() {
      this.seed = 981233;
      this.gates = [];
      this.fibers = [];
      this.residuals = [];
      this.dust = [];
      this.labels = [];

      const rand = () => {
        this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
        return this.seed / 4294967296;
      };
      const xs = [-0.040, 0.055, 0.151, 0.270, 0.399, 0.538, 0.677, 0.816, 0.970].map((value) => this.w * value);
      const specs = [
        { top: 0.145, bottom: 0.875, w: 3.0, rows: 28, name: "TOK", lean: -1.1 },
        { top: 0.010, bottom: 0.972, w: 4.5, rows: 57, name: "EMB", lean: 0.7 },
        { top: 0.062, bottom: 0.998, w: 5.6, rows: 60, name: "ATTN", lean: -1.0 },
        { top: 0.000, bottom: 0.925, w: 3.8, rows: 52, name: "MIX", lean: 1.0 },
        { top: 0.180, bottom: 0.820, w: 6.2, rows: 34, name: "MLP", lean: -0.4 },
        { top: 0.025, bottom: 0.982, w: 3.5, rows: 52, name: "NORM", lean: 0.9 },
        { top: 0.105, bottom: 0.905, w: 4.8, rows: 42, name: "DEC", lean: -0.8 },
        { top: 0.000, bottom: 1.000, w: 2.8, rows: 60, name: "RES", lean: 0.4 },
        { top: 0.250, bottom: 0.760, w: 4.2, rows: 26, name: "LOG", lean: 0 }
      ];

      for (let index = 0; index < specs.length; index += 1) {
        const spec = specs[index];
        this.gates.push({
          id: index,
          x: xs[index],
          top: this.h * spec.top,
          bottom: this.h * spec.bottom,
          width: spec.w,
          rows: spec.rows,
          name: spec.name,
          lean: spec.lean,
          phase: rand() * Math.PI * 2,
          sway: lerp(0.35, 1.45, rand())
        });
      }

      this.gateField = this.gates.map(() => ({ strength: 0, t: 0.5 }));
      const mobile = this.w < 760;
      const tablet = this.w >= 760 && this.w < 1080;
      const quality = lowPowerMode ? 0.64 : 1;
      const density = (this.settings.filamentDensity || 1) * quality;
      const base = mobile ? 62 : tablet ? 98 : 176;
      const pairDensity = [base * 1.24, base * 2.05, base * 1.92, base * 1.48, base * 1.62, base * 1.36, base * 1.44, base * 1.00];
      let fiberId = 0;

      for (let gateIndex = 0; gateIndex < this.gates.length - 1; gateIndex += 1) {
        const count = Math.floor(pairDensity[gateIndex] * density);
        const heads = gateIndex === 1 || gateIndex === 2 ? 12 : gateIndex === 3 || gateIndex === 4 ? 8 : 6;
        for (let i = 0; i < count; i += 1) {
          const head = i % heads;
          const headCenter = (head + 0.5) / heads;
          const ordered = i / Math.max(1, count - 1);
          const bandNoise = (rand() - 0.5) * (gateIndex === 1 || gateIndex === 2 ? 0.26 : 0.20);
          const fixedLeft = clamp(
            gateIndex === 0 ? ordered + (rand() - 0.5) * 0.020 : headCenter + (ordered - 0.5) * 0.20 + bandNoise,
            0.004,
            0.996
          );
          const rightBase = clamp(headCenter + Math.sin(ordered * Math.PI * 2.4 + gateIndex * 0.73) * 0.105 + (rand() - 0.5) * 0.25, 0.004, 0.996);
          const power = rand() > (mobile ? 0.925 : 0.890);
          this.fibers.push({
            id: fiberId,
            from: gateIndex,
            to: gateIndex + 1,
            leftT: fixedLeft,
            rightBaseT: rightBase,
            seekAmp: lerp(0.018, 0.105, rand()) * (mobile ? 0.56 : lowPowerMode ? 0.74 : 1),
            microAmp: lerp(0.006, 0.034, rand()) * (mobile ? 0.58 : lowPowerMode ? 0.70 : 1),
            phase: rand() * 240,
            cycleSpeed: lerp(0.038, 0.112, rand()) * (power ? 1.18 : 1) * (this.settings.speed || 1),
            wiggleSpeed: lerp(0.22, 0.82, rand()) * (power ? 1.16 : 1) * (this.settings.speed || 1),
            bend: lerp(-0.48, 0.48, rand()),
            tension: lerp(0.26, 0.68, rand()),
            opacity: lerp(0.010, 0.070, rand()) * (power ? 1.32 : 1),
            width: lerp(0.16, 0.52, rand()) * (power ? lerp(1.25, 1.78, rand()) : 1),
            power,
            hot: rand() > 0.982,
            hair: rand() > (lowPowerMode ? 0.80 : 0.62)
          });
          fiberId += 1;
        }
      }

      const skipCount = lowPowerMode ? (mobile ? 24 : 38) : mobile ? 34 : tablet ? 54 : 76;
      const skipPairs = [[1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [1, 5], [3, 7]];
      for (const pair of skipPairs) {
        for (let i = 0; i < skipCount / skipPairs.length; i += 1) {
          this.residuals.push({
            from: pair[0],
            to: pair[1],
            leftT: clamp(rand(), 0.02, 0.98),
            rightBaseT: clamp(rand(), 0.02, 0.98),
            amp: lerp(0.010, 0.045, rand()) * (mobile ? 0.55 : 1),
            phase: rand() * 120,
            speed: lerp(0.030, 0.095, rand()) * (this.settings.speed || 1),
            bend: lerp(-0.30, 0.30, rand()),
            opacity: lerp(0.008, 0.030, rand())
          });
        }
      }

      const dustCount = lowPowerMode ? (mobile ? 46 : 72) : mobile ? 74 : tablet ? 112 : 152;
      for (let i = 0; i < dustCount; i += 1) {
        this.dust.push({
          x: rand() * this.w,
          y: rand() * this.h,
          r: lerp(0.26, 0.94, rand()),
          phase: rand() * 100,
          speed: lerp(0.012, 0.045, rand()),
          a: lerp(0.018, 0.094, rand())
        });
      }

      this.labels = [
        { gate: 0, lines: ["tokens", "x0..xn"], dx: 10, dy: 11, phase: rand() * 20 },
        { gate: 1, lines: ["embedding", "vector map"], dx: 10, dy: -23, phase: rand() * 20 },
        { gate: 2, lines: ["attention", "heads / scores"], dx: -4, dy: 11, phase: rand() * 20 },
        { gate: 4, lines: ["ffn / mlp", "expand / gate"], dx: -4, dy: 11, phase: rand() * 20 },
        { gate: 7, lines: ["residual", "norm stream"], dx: -4, dy: -23, phase: rand() * 20 },
        { gate: 8, lines: ["logits", "next token"], dx: -4, dy: 11, phase: rand() * 20 }
      ];
    }

    hash2(a, b) {
      const value = Math.sin(a * 269.5 + b * 183.3 + 17.1) * 43758.5453123;
      return value - Math.floor(value);
    }

    gatePoint(gate, t, time) {
      const wobble = Math.sin(time * 0.14 + gate.phase) * gate.sway;
      const xTop = gate.x + wobble - gate.lean;
      const xBot = gate.x + wobble + gate.lean;
      return { x: lerp(xTop, xBot, clamp(t, 0, 1)), y: lerp(gate.top, gate.bottom, clamp(t, 0, 1)) };
    }

    staticGatePoint(gate, t) {
      return { x: gate.x, y: lerp(gate.top, gate.bottom, clamp(t, 0, 1)) };
    }

    pointerPixels() {
      return {
        x: this.w * (0.5 + this.pointer.x * 0.5),
        y: this.h * (0.5 + this.pointer.y * 0.5)
      };
    }

    updateGateField() {
      const p = this.pointerPixels();
      const radiusX = this.w < 760 ? 220 : Math.min(430, Math.max(285, this.w * 0.245));
      const radiusY = Math.min(285, Math.max(175, this.h * 0.235));
      for (const gate of this.gates) {
        const current = this.gateField[gate.id];
        let targetStrength = 0;
        let targetT = current.t;
        if (this.pointer.active) {
          targetT = clamp((p.y - gate.top) / Math.max(1, gate.bottom - gate.top), 0, 1);
          const gp = this.staticGatePoint(gate, targetT);
          const nx = Math.abs(p.x - gp.x) / radiusX;
          const ny = Math.abs(p.y - gp.y) / radiusY;
          const distance = Math.sqrt(nx * nx + ny * ny * 0.72);
          targetStrength = ease(clamp(1 - distance, 0, 1)) * (this.settings.attraction || 1);
        }
        const smoothing = targetStrength > current.strength ? 0.085 + targetStrength * 0.055 : 0.060;
        current.strength = lerp(current.strength, targetStrength, smoothing);
        current.t = lerp(current.t, targetT, this.pointer.active ? 0.090 + targetStrength * 0.055 : 0.045);
      }
    }

    gateHover(id) {
      return this.gateField?.[id]?.strength || 0;
    }

    gateHoverT(id) {
      return this.gateField?.[id]?.t || 0.5;
    }

    filamentState(fiber, time) {
      const raw = time * fiber.cycleSpeed + fiber.phase;
      const index = Math.floor(raw);
      const p = raw - index;
      const seek = clamp(p / 0.66, 0, 1);
      const fade = clamp((p - 0.78) / 0.22, 0, 1);
      const h1 = this.hash2(fiber.id, index);
      const h2 = this.hash2(fiber.id, index + 1);
      const targetA = clamp(fiber.rightBaseT + (h1 - 0.5) * fiber.seekAmp * 2, 0.004, 0.996);
      const targetB = clamp(fiber.rightBaseT + (h2 - 0.5) * fiber.seekAmp * 2, 0.004, 0.996);
      const searching = Math.sin(time * fiber.wiggleSpeed + fiber.phase) * fiber.seekAmp + Math.sin(time * fiber.wiggleSpeed * 2.1 + fiber.id) * fiber.microAmp;
      if (p < 0.66) return { rightT: clamp(lerp(targetA, targetB, ease(seek)) + searching * (1 - seek * 0.50), 0.004, 0.996), prominence: 0.18 + ease(seek) * 0.72 };
      if (p < 0.78) return { rightT: clamp(targetB + Math.sin(time * fiber.wiggleSpeed * 0.42 + fiber.phase) * fiber.microAmp * 0.16, 0.004, 0.996), prominence: 0.95 };
      return { rightT: clamp(targetB + Math.sin(time * fiber.wiggleSpeed * 0.32 + fiber.phase) * fiber.microAmp * 0.24, 0.004, 0.996), prominence: lerp(0.86, 0.14, ease(fade)) };
    }

    fiberCurve(fiber, time) {
      const state = this.filamentState(fiber, time);
      const a = this.gates[fiber.from];
      const b = this.gates[fiber.to];
      const from = this.gateHover(fiber.from);
      const to = this.gateHover(fiber.to);
      const glow = Math.max(to, from * 0.78, this.gateHover(fiber.from - 1) * 0.10, this.gateHover(fiber.to + 1) * 0.10);
      const leftT = clamp(lerp(fiber.leftT, this.gateHoverT(fiber.from), from * 0.050), 0.004, 0.996);
      const rightT = clamp(lerp(state.rightT, this.gateHoverT(fiber.to), to * 0.500), 0.004, 0.996);
      const left = this.gatePoint(a, leftT, time);
      const right = this.gatePoint(b, rightT, time);
      const dx = right.x - left.x;
      const dy = right.y - left.y;
      const seekFlex = (1.05 - Math.min(1, state.prominence)) * 0.10;
      const powerFlex = fiber.power ? 1.10 : 1;
      const hoverFlex = 1 + glow * 0.145;
      const wave = Math.sin(time * fiber.wiggleSpeed * 0.58 + fiber.phase) * this.h * (0.010 + seekFlex) * powerFlex * hoverFlex;
      const cross = Math.cos(time * fiber.wiggleSpeed * 0.90 + fiber.phase * 0.23) * this.h * (0.006 + seekFlex * 0.30) * powerFlex * hoverFlex;
      const bend = fiber.bend * this.h * 0.082;
      return {
        left,
        right,
        c1: { x: left.x + dx * fiber.tension, y: left.y + dy * 0.045 + bend + wave },
        c2: { x: right.x - dx * fiber.tension, y: right.y - dy * 0.045 - bend * 0.58 - wave * 0.52 + cross },
        state,
        influence: glow
      };
    }

    cachedFiberCurve(fiber, time) {
      if (!this.curveCache || this.curveCacheTime !== time) {
        this.curveCacheTime = time;
        this.curveCache = [];
      }
      if (!this.curveCache[fiber.id]) this.curveCache[fiber.id] = this.fiberCurve(fiber, time);
      return this.curveCache[fiber.id];
    }

    drawBezier(curve, color, width) {
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(curve.left.x, curve.left.y);
      ctx.bezierCurveTo(curve.c1.x, curve.c1.y, curve.c2.x, curve.c2.y, curve.right.x, curve.right.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    }

    draw(time) {
      const ctx = this.ctx;
      const glow = (this.settings.glow || 1) * 1.22;
      this.updateGateField();
      ctx.clearRect(0, 0, this.w, this.h);
      const bg = ctx.createLinearGradient(0, 0, this.w, this.h);
      bg.addColorStop(0, "#050815");
      bg.addColorStop(0.55, "#09142c");
      bg.addColorStop(1, "#141b35");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.w, this.h);

      const zoom = reducedMotion ? 1 : 1 + Math.sin(time * 0.035) * 0.009 + Math.sin(time * 0.019) * 0.006;
      ctx.save();
      ctx.translate(this.w / 2 + Math.sin(time * 0.018) * this.w * 0.007, this.h / 2 + Math.cos(time * 0.021) * this.h * 0.006);
      ctx.scale(zoom, zoom);
      ctx.translate(-this.w / 2, -this.h / 2);
      ctx.globalCompositeOperation = "lighter";

      for (let dustIndex = 0; dustIndex < this.dust.length; dustIndex += lowPowerMode ? 2 : 1) {
        const p = this.dust[dustIndex];
        const x = p.x + Math.sin(time * p.speed + p.phase) * 5;
        const y = p.y + Math.cos(time * p.speed * 1.6 + p.phase) * 3;
        const alpha = p.a * (0.50 + 0.50 * Math.sin(time * 0.38 + p.phase)) * glow;
        ctx.fillStyle = `rgba(215,238,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < this.fibers.length; i += 1) {
        const fiber = this.fibers[i];
        if (!fiber.power && i % (lowPowerMode ? 12 : 7) !== 0) continue;
        const curve = this.cachedFiberCurve(fiber, time);
        const prominence = curve.state.prominence + curve.influence * 1.05;
        if (prominence < 0.38 && !fiber.power) continue;
        const alpha = fiber.opacity * (0.18 + prominence * 0.52) * glow;
        const width = fiber.width * (fiber.power ? 1.70 : 1.18) * (1 + curve.influence * 0.74);
        this.drawBezier(curve, fiber.hot ? `rgba(255,108,94,${alpha * 0.42})` : `rgba(195,232,255,${alpha * 0.56})`, width);
      }

      for (let i = 0; i < this.fibers.length; i += lowPowerMode ? 2 : 1) {
        const fiber = this.fibers[i];
        const curve = this.cachedFiberCurve(fiber, time);
        const shimmer = 0.80 + 0.20 * Math.sin(time * (0.76 + fiber.cycleSpeed) + fiber.phase);
        const prominence = curve.state.prominence * shimmer + curve.influence;
        const alphaCap = fiber.power ? 0.34 : 0.25;
        const alpha = clamp(fiber.opacity * (0.24 + prominence * (fiber.power ? 2.12 : 1.74)) * glow, 0.006, alphaCap);
        const width = fiber.width * (1 + prominence * (fiber.power ? 0.30 : 0.12) + curve.influence * 0.62);
        const color = fiber.hot
          ? `rgba(255,112,101,${alpha * 0.78})`
          : fiber.power
            ? `rgba(236,248,255,${alpha * 1.16})`
            : `rgba(224,242,255,${alpha})`;
        this.drawBezier(curve, color, width);
      }

      for (let i = 0; i < this.fibers.length; i += lowPowerMode ? 5 : 2) {
        const fiber = this.fibers[i];
        if (!fiber.hair) continue;
        const curve = this.cachedFiberCurve(fiber, time);
        const alpha = fiber.opacity * (0.30 + curve.influence * 0.46) * curve.state.prominence * glow;
        this.drawBezier(curve, `rgba(220,240,255,${alpha})`, 0.26 + curve.influence * 0.18);
      }

      for (let residualIndex = 0; residualIndex < this.residuals.length; residualIndex += lowPowerMode ? 2 : 1) {
        const residual = this.residuals[residualIndex];
        const a = this.gates[residual.from];
        const b = this.gates[residual.to];
        const left = this.gatePoint(a, residual.leftT, time);
        const rightT = clamp(residual.rightBaseT + Math.sin(time * residual.speed + residual.phase) * residual.amp, 0.004, 0.996);
        const right = this.gatePoint(b, rightT, time);
        const dx = right.x - left.x;
        const rise = residual.bend * this.h * 0.19 + Math.sin(time * residual.speed + residual.phase) * this.h * 0.012;
        this.drawBezier({
          left,
          right,
          c1: { x: left.x + dx * 0.46, y: left.y + rise },
          c2: { x: right.x - dx * 0.46, y: right.y - rise * 0.56 }
        }, `rgba(178,226,255,${residual.opacity * glow * 1.45})`, 0.52);
      }

      for (const gate of this.gates) {
        const hover = this.gateHover(gate.id);
        const hoverT = this.gateHoverT(gate.id);
        const top = this.gatePoint(gate, 0, time);
        const bottom = this.gatePoint(gate, 1, time);
        const xTop = top.x;
        const xBot = bottom.x;
        const leftTop = xTop - gate.width / 2;
        const leftBot = xBot - gate.width / 2;
        ctx.beginPath();
        ctx.moveTo(leftTop, gate.top);
        ctx.lineTo(leftTop + gate.width, gate.top);
        ctx.lineTo(leftBot + gate.width, gate.bottom);
        ctx.lineTo(leftBot, gate.bottom);
        ctx.closePath();
        ctx.fillStyle = `rgba(124,198,255,${0.014 + hover * 0.018})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(151,208,255,${0.120 + hover * 0.140})`;
        ctx.lineWidth = 0.62 + hover * 0.36;
        ctx.stroke();
        ctx.strokeStyle = `rgba(220,240,255,${0.086 + hover * 0.128})`;
        ctx.lineWidth = 0.48 + hover * 0.44;
        ctx.beginPath();
        ctx.moveTo(xTop, gate.top);
        ctx.lineTo(xBot, gate.bottom);
        ctx.stroke();
        for (let i = 0; i < gate.rows; i += lowPowerMode ? 2 : 1) {
          const p = i / Math.max(1, gate.rows - 1);
          const x = lerp(xTop, xBot, p);
          const y = lerp(gate.top + 7, gate.bottom - 7, p);
          const activity = 0.46 + 0.54 * Math.sin(time * 0.78 + gate.phase + i * 0.54);
          const nearMouse = hover * Math.max(0, 1 - Math.abs(p - hoverT) * 9);
          ctx.fillStyle = `rgba(232,246,255,${(0.095 + activity * 0.170 + nearMouse * 0.24) * glow})`;
          ctx.fillRect(x - 0.68, y - 0.48, 1.36, 0.96);
        }
      }

      for (let i = 0; i < this.fibers.length; i += lowPowerMode ? 34 : this.w < 760 ? 26 : 18) {
        const fiber = this.fibers[i];
        const curve = this.cachedFiberCurve(fiber, time);
        const u = (time * (0.035 + fiber.cycleSpeed * 0.035) + fiber.phase * 0.011) % 1;
        const v = 1 - ease(u);
        const e = ease(u);
        const point = {
          x: v * v * v * curve.left.x + 3 * v * v * e * curve.c1.x + 3 * v * e * e * curve.c2.x + e * e * e * curve.right.x,
          y: v * v * v * curve.left.y + 3 * v * v * e * curve.c1.y + 3 * v * e * e * curve.c2.y + e * e * e * curve.right.y
        };
        const alpha = (0.070 + 0.260 * Math.sin(Math.PI * u)) * (curve.state.prominence + curve.influence * 0.72) * glow;
        ctx.fillStyle = fiber.hot ? `rgba(255,110,98,${alpha * 0.70})` : `rgba(226,246,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, fiber.power ? 1.08 : 0.78, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const gate of this.gates) {
        const strength = this.gateHover(gate.id);
        if (strength < 0.018) continue;
        const point = this.gatePoint(gate, this.gateHoverT(gate.id), time);
        const radius = 26 + strength * 92;
        const halo = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        halo.addColorStop(0, `rgba(236,250,255,${0.110 * strength})`);
        halo.addColorStop(0.28, `rgba(145,222,255,${0.055 * strength})`);
        halo.addColorStop(1, "rgba(145,222,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (this.w >= 500) {
        ctx.font = this.w < 760 ? "8px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" : "9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.textBaseline = "top";
        for (const label of this.labels) {
          if ((this.settings.labelDensity || 1) <= 0) continue;
          const gate = this.gates[label.gate];
          const hover = this.gateHover(gate.id);
          const flicker = 0.68 + 0.32 * Math.sin(time * 1.05 + label.phase);
          const x = clamp(gate.x + label.dx, 8, this.w - 124);
          const y = clamp(gate.top + label.dy, 8, this.h - 42);
          ctx.fillStyle = `rgba(158,224,255,${0.38 * flicker + hover * 0.12})`;
          ctx.fillText(label.lines[0], x, y);
          ctx.fillStyle = label.gate === 8 ? `rgba(255,112,101,${0.36 * flicker + hover * 0.08})` : `rgba(229,242,255,${0.28 * flicker + hover * 0.08})`;
          ctx.fillText(label.lines[1], x, y + 11);
        }
      }
      ctx.restore();
    }
  }

  class NetworkRenderer extends CanvasRenderer {
    rebuild() {
      const density = this.settings.density || 1;
      const quality = lowPowerMode ? 0.62 : 1;
      const cap = lowPowerMode ? 118 : 220;
      const count = Math.min(cap, Math.round(this.w * this.h * (this.w < 760 ? 0.00010 : 0.000145) * density * quality));
      const spread = this.settings.clusterSpread || 1;
      this.values = ["5420", "8456", "2856", "1243", "9856", "7845", "5450", "5426"];
      this.clusters = [
        { x: this.w * 0.15, y: this.h * 0.34, r: Math.min(this.w, this.h) * 0.17 * spread },
        { x: this.w * 0.60, y: this.h * 0.23, r: Math.min(this.w, this.h) * 0.19 * spread },
        { x: this.w * 0.52, y: this.h * 0.76, r: Math.min(this.w, this.h) * 0.22 * spread },
        { x: this.w * 0.82, y: this.h * 0.74, r: Math.min(this.w, this.h) * 0.14 * spread },
        { x: this.w * 0.28, y: this.h * 0.79, r: Math.min(this.w, this.h) * 0.12 * spread }
      ];
      this.nodes = Array.from({ length: count }, (_, index) => {
        const c = this.clusters[Math.floor(seeded(index + 200) * this.clusters.length)];
        const angle = seeded(index + 201) * Math.PI * 2;
        const radius = Math.pow(seeded(index + 202), 1.9) * c.r;
        const clustered = seeded(index + 203) < 0.72;
        return {
          x: clustered ? c.x + Math.cos(angle) * radius : seeded(index + 204) * this.w,
          y: clustered ? c.y + Math.sin(angle) * radius : seeded(index + 205) * this.h,
          z: 0.35 + seeded(index + 206) * 1.4,
          vx: -0.14 + seeded(index + 207) * 0.28,
          vy: -0.12 + seeded(index + 208) * 0.24,
          phase: seeded(index + 209) * Math.PI * 2,
          radius: 0.9 + seeded(index + 210) * 2.6,
          value: this.values[Math.floor(seeded(index + 211) * this.values.length)],
          labelAlpha: seeded(index + 212)
        };
      });
      this.fog = Array.from({ length: Math.round(count * 0.56) }, (_, index) => ({
        x: seeded(index + 260) * this.w,
        y: seeded(index + 261) * this.h,
        len: 42 + seeded(index + 262) * 138,
        alpha: 0.03 + seeded(index + 263) * 0.12,
        speed: 0.03 + seeded(index + 264) * 0.18,
        drift: -0.08 + seeded(index + 265) * 0.16,
        value: this.values[Math.floor(seeded(index + 266) * this.values.length)]
      }));
      this.positions = Array.from({ length: count }, () => ({}));
    }

    draw(time) {
      const ctx = this.ctx;
      const speed = reducedMotion ? 0 : this.settings.speed || 1;
      const accent = this.settings.accent || "#20baff";
      const glow = this.settings.glow || 1;
      const reach = (this.settings.connectionReach || 1) * (this.w < 760 ? 116 : 145);
      ctx.clearRect(0, 0, this.w, this.h);
      const bg = ctx.createLinearGradient(0, 0, 0, this.h);
      bg.addColorStop(0, this.settings.backgroundTop || "#031b42");
      bg.addColorStop(0.5, "#04235a");
      bg.addColorStop(1, this.settings.backgroundBottom || "#031537");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.w, this.h);

      const halo = ctx.createRadialGradient(this.w * (0.52 + this.pointer.x * 0.10), this.h * (0.42 + this.pointer.y * 0.10), 0, this.w * 0.52, this.h * 0.42, Math.max(this.w, this.h) * 0.78);
      halo.addColorStop(0, rgba(accent, 0.16 * glow));
      halo.addColorStop(0.4, rgba(accent, 0.08 * glow));
      halo.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, this.w, this.h);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.font = `700 ${Math.max(18, Math.min(34, this.w * 0.026))}px system-ui, sans-serif`;
      for (let fogIndex = 0; fogIndex < this.fog.length; fogIndex += lowPowerMode ? 2 : 1) {
        const f = this.fog[fogIndex];
        const x = cycle((f.x + time * f.speed * 26 * speed) / (this.w + 220)) * (this.w + 220) - 110 + this.pointer.x * 20;
        const y = f.y + Math.sin(time * 0.18 + f.x) * 9 + this.pointer.y * 12;
        ctx.globalAlpha = f.alpha * glow;
        ctx.fillStyle = accent;
        ctx.fillText(f.value, x, y);
        const grad = ctx.createLinearGradient(x - f.len, y, x + f.len, y);
        grad.addColorStop(0, rgba(accent, 0));
        grad.addColorStop(0.5, rgba(accent, 0.32 * glow));
        grad.addColorStop(1, rgba(accent, 0));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - f.len * 0.55, y + Math.sin(time + f.x) * 8);
        ctx.lineTo(x + f.len * 0.55, y + Math.cos(time + f.y) * 8);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const positions = this.positions;
      for (let index = 0; index < this.nodes.length; index += 1) {
        const node = this.nodes[index];
        const x = cycle((node.x + time * node.vx * 24 * speed * node.z) / (this.w + 120)) * (this.w + 120) - 60 + Math.cos(time * 0.2 + node.phase) * 6 + this.pointer.x * node.z * 18;
        const y = cycle((node.y + time * node.vy * 22 * speed * node.z) / (this.h + 120)) * (this.h + 120) - 60 + Math.sin(time * 0.18 + node.phase) * 6 + this.pointer.y * node.z * 14;
        const position = positions[index];
        position.x = x;
        position.y = y;
        position.z = node.z;
        position.radius = node.radius;
        position.phase = node.phase;
        position.value = node.value;
        position.labelAlpha = node.labelAlpha;
      }

      const reach2 = reach * reach;
      for (let i = 0; i < positions.length; i += 1) {
        const a = positions[i];
        for (let j = i + 1; j < positions.length; j += 1) {
          const b = positions[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance2 = dx * dx + dy * dy;
          if (distance2 > reach2) continue;
          const distance = Math.sqrt(distance2);
          const pulse = 0.72 + Math.sin(time * 1.7 + i * 1.7 + j) * 0.28;
          ctx.strokeStyle = rgba(accent, (1 - distance / reach) * 0.32 * pulse * glow);
          ctx.lineWidth = Math.max(0.45, a.z * 0.68);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const node of positions) {
        const flicker = 0.7 + Math.sin(time * 3 + node.phase) * 0.3;
        ctx.beginPath();
        ctx.fillStyle = rgba(accent, 0.72 * flicker * glow);
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        if (node.z > 0.72 && this.settings.labelDensity > node.labelAlpha) {
          ctx.font = `700 ${Math.round(13 + node.z * 8)}px system-ui, sans-serif`;
          ctx.fillStyle = rgba(accent, 0.24 + node.labelAlpha * 0.30);
          ctx.fillText(node.value, node.x + 12, node.y + 6);
        }
      }
      ctx.restore();
    }
  }

  const rendererFor = (type, root, settings) => {
    if (type === "signal") return new SignalRenderer(root, settings);
    if (type === "decision") return new DecisionRenderer(root, settings);
    return new NetworkRenderer(root, settings);
  };

  const app = {
    activeId: qs.get("banner") || "signal",
    configs: Object.fromEntries(BANNERS.map((banner) => [banner.id, { ...banner.settings }])),
    renderer: null,
    init() {
      this.stage = document.querySelector("[data-hero-stage]");
      this.root = document.querySelector("[data-banner-renderer]");
      this.selector = document.querySelector("[data-lab-selector]");
      this.controls = document.querySelector("[data-lab-controls]");
      this.summary = document.querySelector("[data-lab-summary]");
      this.output = document.querySelector("[data-config-output]");
      this.copyButton = document.querySelector("[data-copy-config]");
      this.downloadButton = document.querySelector("[data-download-config]");
      this.prevButton = document.querySelector("[data-prev-banner]");
      this.nextButton = document.querySelector("[data-next-banner]");
      if (!this.stage || !this.root) return;
      if (qs.get("capture") === "1") {
        document.documentElement.classList.add("capture-mode");
        document.body.classList.add("capture-mode");
      }
      this.renderSelector();
      this.bindGlobal();
      this.bindVisibility();
      this.setActive(this.activeId);
      this.updateParallax();
    },
    banner() {
      return BANNERS.find((banner) => banner.id === this.activeId) || BANNERS[0];
    },
    renderSelector() {
      if (!this.selector) return;
      this.selector.innerHTML = "";
      for (const banner of BANNERS) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = banner.label;
        button.dataset.bannerId = banner.id;
        button.addEventListener("click", () => this.setActive(banner.id));
        this.selector.appendChild(button);
      }
    },
    bindGlobal() {
      window.addEventListener("scroll", () => this.requestParallax(), { passive: true });
      window.addEventListener("resize", () => this.requestParallax(), { passive: true });
      this.stage.addEventListener("pointermove", (event) => {
        const rect = this.stage.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
        this.stage.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
        this.stage.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
      }, { passive: true });
      this.stage.addEventListener("pointerleave", () => {
        this.stage.style.setProperty("--pointer-x", "0px");
        this.stage.style.setProperty("--pointer-y", "0px");
      }, { passive: true });
      if (this.copyButton) {
        this.copyButton.addEventListener("click", async () => {
          await navigator.clipboard.writeText(this.output.value);
          this.copyButton.textContent = "Copied";
          window.setTimeout(() => { this.copyButton.textContent = "Copy JSON"; }, 1400);
        });
      }
      if (this.downloadButton) {
        this.downloadButton.addEventListener("click", () => this.downloadConfig());
      }
      if (this.prevButton) this.prevButton.addEventListener("click", () => this.shift(-1));
      if (this.nextButton) this.nextButton.addEventListener("click", () => this.shift(1));
      window.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") this.shift(-1);
        if (event.key === "ArrowRight") this.shift(1);
      });
    },
    bindVisibility() {
      this.stageVisible = true;
      document.addEventListener("visibilitychange", () => this.updateRendererPlayback());
      if (!("IntersectionObserver" in window)) return;
      this.visibilityObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        this.stageVisible = entry.isIntersecting && entry.intersectionRatio > 0.04;
        this.updateRendererPlayback();
      }, { threshold: [0, 0.04, 0.16] });
      this.visibilityObserver.observe(this.stage);
    },
    updateRendererPlayback() {
      if (!this.renderer) return;
      if (document.hidden || this.stageVisible === false) {
        if (this.renderer.pause) this.renderer.pause();
      } else if (this.renderer.resume) {
        this.renderer.resume();
      }
    },
    requestParallax() {
      if (this.parallaxPending) return;
      this.parallaxPending = true;
      requestAnimationFrame(() => {
        this.parallaxPending = false;
        this.updateParallax();
      });
    },
    updateParallax() {
      const rect = this.stage.getBoundingClientRect();
      const progress = clamp(-rect.top / Math.max(1, rect.height), 0, 1);
      this.stage.style.setProperty("--lab-shift", `${Math.round(progress * 220)}px`);
    },
    shift(direction) {
      const index = BANNERS.findIndex((banner) => banner.id === this.activeId);
      const next = (index + direction + BANNERS.length) % BANNERS.length;
      this.setActive(BANNERS[next].id);
    },
    setActive(id) {
      const found = BANNERS.find((banner) => banner.id === id) || BANNERS[0];
      this.activeId = found.id;
      this.stage.className = `lab-stage is-${found.type}`;
      this.stage.dataset.activeBanner = found.id;
      if (this.renderer) this.renderer.destroy();
      this.root.innerHTML = "";
      this.renderer = rendererFor(found.type, this.root, this.configs[found.id]);
      this.updateRendererPlayback();
      document.querySelector("[data-stage-eyebrow]").textContent = found.eyebrow;
      document.querySelector("[data-stage-title]").textContent = found.title;
      document.querySelector("[data-stage-description]").textContent = found.description;
      const tags = document.querySelector("[data-stage-tags]");
      tags.innerHTML = found.tags.map((tag) => `<span>${tag}</span>`).join("");
      this.renderControls();
      this.renderSummary();
      this.updateButtons();
      this.updateOutput();
      if (!document.body.classList.contains("capture-mode")) {
        history.replaceState(null, "", `${location.pathname}?banner=${found.id}`);
      }
    },
    renderControls() {
      const banner = this.banner();
      const config = this.configs[banner.id];
      this.controls.innerHTML = "";
      for (const control of banner.controls) {
        const field = document.createElement("div");
        field.className = "field";
        const inputId = `control-${banner.id}-${control.key}`;
        const label = document.createElement("label");
        label.setAttribute("for", inputId);
        label.textContent = control.label;
        field.appendChild(label);
        if (control.type === "range") {
          const row = document.createElement("div");
          row.className = "range-row";
          const input = document.createElement("input");
          input.id = inputId;
          input.type = "range";
          input.min = control.min;
          input.max = control.max;
          input.step = control.step;
          input.value = config[control.key];
          const value = document.createElement("span");
          value.className = "range-value";
          value.textContent = this.formatValue(config[control.key]);
          input.addEventListener("input", () => {
            config[control.key] = Number(input.value);
            value.textContent = this.formatValue(config[control.key]);
            this.applyConfig();
          });
          row.append(input, value);
          field.appendChild(row);
        } else {
          const input = document.createElement("input");
          input.id = inputId;
          input.type = "color";
          input.value = config[control.key];
          input.addEventListener("input", () => {
            config[control.key] = input.value;
            this.applyConfig();
          });
          field.appendChild(input);
        }
        this.controls.appendChild(field);
      }
    },
    formatValue(value) {
      if (Number.isInteger(value)) return String(value);
      return Number(value).toFixed(2).replace(/0$/, "").replace(/0$/, "");
    },
    renderSummary() {
      const banner = this.banner();
      this.summary.innerHTML = `
        <p class="section-kicker">${banner.label}</p>
        <h2>${banner.title}</h2>
        <p>${banner.description}</p>
        <ul class="config-list">
          <li><strong>Frame</strong><span>100vh capture stage</span></li>
          <li><strong>Motion</strong><span>Scroll parallax + pointer response</span></li>
          <li><strong>Output</strong><span>Reusable JSON settings</span></li>
        </ul>
      `;
    },
    updateButtons() {
      if (!this.selector) return;
      for (const button of this.selector.querySelectorAll("button")) {
        button.setAttribute("aria-pressed", String(button.dataset.bannerId === this.activeId));
      }
    },
    applyConfig() {
      this.renderer.update(this.configs[this.activeId]);
      this.updateOutput();
    },
    updateOutput() {
      if (!this.output) return;
      const banner = this.banner();
      this.output.value = JSON.stringify({
        banner: banner.id,
        type: banner.type,
        captureFrame: "100vh",
        settings: this.configs[banner.id]
      }, null, 2);
    },
    downloadConfig() {
      const blob = new Blob([this.output.value], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${this.activeId}-hero-config.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
  };

  document.addEventListener("DOMContentLoaded", () => app.init());
})();
