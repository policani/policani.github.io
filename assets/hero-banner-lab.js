(() => {
  "use strict";

  const qs = new URLSearchParams(window.location.search);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        filamentDensity: 1.26,
        speed: 1,
        glow: 1.28,
        attraction: 1,
        labelDensity: 0.86,
        accent: "#9bdfff",
        hotAccent: "#ff7065"
      },
      controls: [
        { key: "gateCount", label: "Gate columns", type: "range", min: 6, max: 11, step: 1 },
        { key: "filamentDensity", label: "Filament density", type: "range", min: 0.45, max: 1.65, step: 0.05 },
        { key: "speed", label: "Speed", type: "range", min: 0.35, max: 1.75, step: 0.05 },
        { key: "glow", label: "Glow", type: "range", min: 0.35, max: 1.55, step: 0.05 },
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
      this.raf = requestAnimationFrame(this.frame);
    }

    update(settings) {
      this.settings = { ...this.settings, ...settings };
      this.rebuild();
    }

    destroy() {
      cancelAnimationFrame(this.raf);
      window.removeEventListener("resize", this.resize);
      this.root.removeEventListener("pointermove", this.onMove);
      this.root.removeEventListener("pointerenter", this.onMove);
      this.root.removeEventListener("pointerleave", this.onLeave);
      this.canvas.remove();
    }

    resize() {
      const rect = this.root.getBoundingClientRect();
      this.w = Math.max(320, Math.floor(rect.width));
      this.h = Math.max(420, Math.floor(rect.height));
      this.dpr = Math.min(window.devicePixelRatio || 1, this.w < 760 ? 1 : 1.3);
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
      const minFrame = reducedMotion ? 180 : this.w < 760 ? 42 : 30;
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

    destroy() {
      if (this.instance) this.instance.destroy();
      this.host.remove();
    }
  }

  class DecisionRenderer extends CanvasRenderer {
    rebuild() {
      const gateCount = Math.round(this.settings.gateCount || 9);
      const spread = this.w / Math.max(1, gateCount - 1);
      this.gates = Array.from({ length: gateCount }, (_, index) => ({
        x: index * spread + (index === 0 ? -spread * 0.22 : index === gateCount - 1 ? spread * 0.22 : 0),
        top: this.h * (0.03 + seeded(index + 20) * 0.16),
        bottom: this.h * (0.82 + seeded(index + 30) * 0.16),
        rows: Math.round(26 + seeded(index + 40) * 34),
        width: 2.6 + seeded(index + 50) * 3.8,
        lean: -1.2 + seeded(index + 60) * 2.4,
        phase: seeded(index + 70) * Math.PI * 2
      }));

      const count = Math.round((this.w < 760 ? 86 : 210) * (this.settings.filamentDensity || 1));
      this.fibers = Array.from({ length: count }, (_, index) => {
        const from = Math.floor(seeded(index + 80) * Math.max(1, gateCount - 1));
        return {
          from,
          to: Math.min(gateCount - 1, from + 1 + (seeded(index + 81) > 0.88 ? 1 : 0)),
          a: seeded(index + 82),
          b: seeded(index + 83),
          phase: seeded(index + 84) * 90,
          speed: (0.035 + seeded(index + 85) * 0.09) * (this.settings.speed || 1),
          bend: -0.5 + seeded(index + 86),
          width: 0.22 + seeded(index + 87) * 0.7,
          hot: seeded(index + 88) > 0.965
        };
      });

      this.dust = Array.from({ length: this.w < 760 ? 60 : 130 }, (_, index) => ({
        x: seeded(index + 100) * this.w,
        y: seeded(index + 101) * this.h,
        r: 0.35 + seeded(index + 102) * 0.9,
        phase: seeded(index + 103) * 40
      }));
    }

    gatePoint(gate, t, time) {
      const wobble = Math.sin(time * 0.13 + gate.phase) * 1.2;
      const xTop = gate.x + wobble - gate.lean;
      const xBot = gate.x + wobble + gate.lean;
      return {
        x: lerp(xTop, xBot, clamp(t, 0, 1)),
        y: lerp(gate.top, gate.bottom, clamp(t, 0, 1))
      };
    }

    draw(time) {
      const ctx = this.ctx;
      const glow = this.settings.glow || 1;
      ctx.clearRect(0, 0, this.w, this.h);
      const bg = ctx.createLinearGradient(0, 0, this.w, this.h);
      bg.addColorStop(0, "#050815");
      bg.addColorStop(0.55, "#09142c");
      bg.addColorStop(1, "#141b35");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.w, this.h);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const p of this.dust) {
        const x = p.x + Math.sin(time * 0.23 + p.phase) * 8 + this.pointer.x * 18;
        const y = p.y + Math.cos(time * 0.19 + p.phase) * 6 + this.pointer.y * 12;
        ctx.fillStyle = `rgba(215,238,255,${0.035 * glow + seeded(p.phase) * 0.062})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const fiber of this.fibers) {
        const a = this.gates[fiber.from];
        const b = this.gates[fiber.to];
        if (!a || !b) continue;
        const flow = cycle(time * fiber.speed + fiber.phase);
        const attract = (this.settings.attraction || 0) * 0.12;
        const p1 = this.gatePoint(a, fiber.a, time);
        const targetT = clamp(fiber.b + Math.sin(time * 0.52 + fiber.phase) * 0.09 + this.pointer.y * attract, 0.01, 0.99);
        const p2 = this.gatePoint(b, targetT, time);
        const dx = p2.x - p1.x;
        const lift = fiber.bend * this.h * 0.08 + Math.sin(time * 0.7 + fiber.phase) * this.h * 0.014;
        const prominence = 0.28 + ease(flow) * 0.65 + Math.abs(this.pointer.x) * attract * 3;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(p1.x + dx * 0.35, p1.y + lift, p2.x - dx * 0.38, p2.y - lift * 0.5, p2.x, p2.y);
        ctx.strokeStyle = fiber.hot
          ? rgba(this.settings.hotAccent, clamp(0.045 + prominence * 0.18 * glow, 0, 0.46))
          : rgba(this.settings.accent, clamp(0.030 + prominence * 0.17 * glow, 0, 0.40));
        ctx.lineWidth = fiber.width * (1 + prominence * 0.42);
        ctx.stroke();
      }

      for (let index = 0; index < this.gates.length; index += 1) {
        const gate = this.gates[index];
        const hoverT = clamp(0.5 + this.pointer.y * 0.38, 0, 1);
        const hoverDistance = Math.abs((gate.x / this.w - 0.5) * 2 - this.pointer.x);
        const hover = clamp(1 - hoverDistance * 1.65, 0, 1) * (this.settings.attraction || 1);
        const top = this.gatePoint(gate, 0, time);
        const bottom = this.gatePoint(gate, 1, time);
        ctx.lineWidth = 0.8 + hover * 0.5;
        ctx.strokeStyle = rgba(this.settings.accent, 0.18 + hover * 0.24 * glow);
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.stroke();
        for (let row = 0; row < gate.rows; row += 1) {
          const t = row / Math.max(1, gate.rows - 1);
          const point = this.gatePoint(gate, t, time);
          const active = Math.max(0, 1 - Math.abs(t - hoverT) * 8) * hover;
          ctx.fillStyle = rgba(this.settings.accent, 0.14 + active * 0.36);
          ctx.fillRect(point.x - 0.8, point.y - 0.55, 1.6, 1.1);
        }
        if (this.settings.labelDensity > seeded(index + 140)) {
          ctx.font = "10px ui-monospace, SFMono-Regular, Consolas, monospace";
          ctx.fillStyle = rgba(this.settings.accent, 0.38);
          ctx.fillText(["TOK", "EMB", "ATTN", "MIX", "MLP", "NORM", "DEC", "RES", "LOG", "OUT", "REV"][index] || `L${index}`, clamp(gate.x + 8, 8, this.w - 60), clamp(gate.top + 8, 10, this.h - 30));
        }
      }
      ctx.restore();
    }
  }

  class NetworkRenderer extends CanvasRenderer {
    rebuild() {
      const density = this.settings.density || 1;
      const count = Math.round(this.w * this.h * (this.w < 760 ? 0.00011 : 0.00016) * density);
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
      for (const f of this.fog) {
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

      const positions = this.nodes.map((node, index) => {
        const x = cycle((node.x + time * node.vx * 24 * speed * node.z) / (this.w + 120)) * (this.w + 120) - 60 + Math.cos(time * 0.2 + node.phase) * 6 + this.pointer.x * node.z * 18;
        const y = cycle((node.y + time * node.vy * 22 * speed * node.z) / (this.h + 120)) * (this.h + 120) - 60 + Math.sin(time * 0.18 + node.phase) * 6 + this.pointer.y * node.z * 14;
        return { ...node, x, y, index };
      });

      for (let i = 0; i < positions.length; i += 1) {
        const a = positions[i];
        for (let j = i + 1; j < positions.length; j += 1) {
          const b = positions[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > reach) continue;
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
      this.root.innerHTML = "";
      if (this.renderer) this.renderer.destroy();
      this.renderer = rendererFor(found.type, this.root, this.configs[found.id]);
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
