const canvas = document.querySelector(".portfolio-hero-filament-canvas");
const hero = canvas?.closest(".hero");

if (canvas && hero) {
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    pointerX: 0,
    pointerY: 0,
    targetX: 0,
    targetY: 0,
    scroll: 0,
    start: performance.now(),
    modules: []
  };

  const compact = () => window.matchMedia("(max-width: 760px)").matches;
  const mix = (a, b, t) => a + (b - a) * t;
  const cycle = (value) => ((value % 1) + 1) % 1;
  const seeded = (index) => {
    const x = Math.sin(index * 999.13) * 10000;
    return x - Math.floor(x);
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    state.width = Math.max(1, rect.width);
    state.height = Math.max(1, rect.height * 1.2);
    state.dpr = Math.min(window.devicePixelRatio || 1, compact() ? 1.25 : 1.6);
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    buildModules();
  };

  const buildModules = () => {
    const count = compact() ? 18 : 36;
    const clusters = [
      { code: "GRO", name: "Growth", y: 0.18, tone: 0.78 },
      { code: "EFF", name: "Efficiency", y: 0.30, tone: 0.58 },
      { code: "RSK", name: "Risk", y: 0.43, tone: 0.42 },
      { code: "EXP", name: "Experience", y: 0.56, tone: 0.68 },
      { code: "CAP", name: "Capacity", y: 0.68, tone: 0.18 },
      { code: "VAL", name: "Value", y: 0.78, tone: 0.50 }
    ];
    const initiatives = [
      "Growth Portfolio",
      "Margin Program",
      "Customer Trust",
      "Experience Uplift",
      "Capacity Plan",
      "Benefits Office",
      "Market Entry",
      "Cost Transformation",
      "Regulatory Readiness",
      "Service Redesign",
      "Partner Strategy",
      "Value Realization",
      "Revenue Assurance",
      "Operating Model",
      "Audit Readiness",
      "Journey Simplify",
      "Resource Planning",
      "Outcome Dashboard",
      "Lifecycle Renewal",
      "Executive Cadence",
      "Policy Remediation",
      "Board Reporting",
      "Vendor Strategy",
      "Benefit Recovery",
      "Pricing Strategy",
      "Demand Governance",
      "Control Framework",
      "Service Deflection",
      "Portfolio Intake",
      "KPI Standardization",
      "Decision Backlog",
      "Adoption Program",
      "Investment Review",
      "Funding Reset",
      "Scenario Plan",
      "Value Roadmap"
    ];
    const stages = ["INTAKE", "SCORED", "FUNDED", "ACTIVE", "GATE", "BENEFITS"];
    const health = ["GREEN", "GREEN", "AMBER", "AMBER", "RED"];
    const owners = ["PMO", "OPS", "FIN", "CX", "RISK", "DATA"];
    const strategy = ["GROWTH", "MARGIN", "RISK", "CX", "SCALE", "VALUE"];
    const rows = [
      ["SCORE", "OWNER", "BV", "FUND", "DEC", "READY"],
      ["STAGE", "RAG", "ALIGN", "CAP", "DEP", "BEN"],
      ["SCORE", "PRIOR", "ROI", "RISK", "GATE", "MILE"],
      ["STAGE", "BV", "FUND", "DEC", "FORE", "OUT"]
    ];
    state.modules = Array.from({ length: count }, (_, index) => {
      const depth = 0.58 + seeded(index + 4) * 0.72;
      const cluster = clusters[index % clusters.length];
      const width = (132 + seeded(index + 8) * 86) * depth;
      const height = (82 + seeded(index + 11) * 34) * depth;
      const budget = (0.8 + seeded(index + 13) * 7.8).toFixed(1);
      const value = (1.2 + seeded(index + 14) * 12.5).toFixed(1);
      const deps = Math.max(1, Math.round(seeded(index + 15) * 8));
      const decisions = Math.max(0, Math.round(seeded(index + 16) * 4));
      const ready = Math.round(48 + seeded(index + 18) * 42);
      const forecast = Math.round(55 + seeded(index + 19) * 34);
      const score = Math.round(58 + seeded(index + 20) * 36);
      const roi = (1.1 + seeded(index + 30) * 3.6).toFixed(1);
      const capacity = Math.round(6 + seeded(index + 31) * 34);
      return {
        id: index,
        code: `${cluster.code}-${String(120 + index * 7).padStart(3, "0")}`,
        title: initiatives[index % initiatives.length],
        cluster,
        dependencyCluster: clusters[(index + 2 + Math.floor(seeded(index + 9) * 2)) % clusters.length].code,
        baseX: seeded(index + 1),
        y: state.height * (cluster.y + (seeded(index + 2) - 0.5) * 0.08),
        width,
        height,
        depth,
        speed: (0.010 + seeded(index + 3) * 0.014) / depth,
        phase: seeded(index + 5),
        tone: seeded(index + 6),
        rows: rows[index % rows.length],
        metrics: {
          stage: stages[Math.floor(seeded(index + 21) * stages.length)],
          rag: health[Math.floor(seeded(index + 22) * health.length)],
          owner: owners[Math.floor(seeded(index + 23) * owners.length)],
          priority: `P${Math.max(1, Math.min(4, Math.ceil(seeded(index + 24) * 4)))}`,
          budget,
          value,
          deps,
          decisions,
          ready,
          forecast,
          milestone: `D+${Math.round(8 + seeded(index + 25) * 52)}`,
          benefit: `${Math.round(44 + seeded(index + 26) * 44)}%`,
          score,
          roi,
          capacity,
          risk: ["LOW", "MED", "MED", "HIGH"][Math.floor(seeded(index + 27) * 4)],
          alignment: strategy[Math.floor(seeded(index + 28) * strategy.length)]
        }
      };
    });
  };

  const roundRect = (x, y, w, h, r = 8) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  };

  const modulePosition = (module, time) => {
    const travel = state.width + module.width + 120;
    const progress = cycle(module.baseX + time * module.speed);
    const x = -module.width - 70 + progress * travel;
    const y = module.y
      + Math.sin(time * 0.22 + module.phase * Math.PI * 2) * 18 * module.depth
      + state.pointerY * 22 * module.depth
      + state.scroll * 0.05 * (module.depth - 0.8);
    return {
      x: x + state.pointerX * 28 * module.depth,
      y
    };
  };

  const drawAtmosphere = (time) => {
    const glowX = state.width * (0.62 + state.pointerX * 0.18);
    const glowY = state.height * (0.42 + state.pointerY * 0.14);
    const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(260, state.width * 0.34));
    glow.addColorStop(0, "rgba(64, 225, 248, 0.26)");
    glow.addColorStop(0.38, "rgba(55, 142, 246, 0.13)");
    glow.addColorStop(1, "rgba(39, 124, 236, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.save();
    ctx.translate(state.pointerX * 18, state.pointerY * 10);
    for (let i = 0; i < 10; i += 1) {
      const y = state.height * (0.08 + i * 0.10) + Math.sin(time * 0.25 + i) * 7;
      ctx.beginPath();
      ctx.moveTo(-40, y);
      ctx.lineTo(state.width + 40, y + Math.sin(i * 1.4) * 28);
      ctx.strokeStyle = "rgba(145, 232, 255, 0.09)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawFilaments = (visible, time) => {
    const maxDistance = compact() ? 220 : 340;
    for (let i = 0; i < visible.length; i += 1) {
      for (let j = i + 1; j < visible.length; j += 1) {
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
        if (distance > maxDistance || gate < (sameCluster ? -0.28 : -0.04)) continue;
        const baseOpacity = sameCluster ? 0.34 : 0.46;
        const opacity = Math.min(baseOpacity + 0.08, (1 - distance / maxDistance) * (baseOpacity + 0.16)) * (0.76 + gate * 0.28);
        const midX = (ax + bx) / 2 + Math.sin(time * 0.34 + i) * 18;
        const midY = (ay + by) / 2 + Math.cos(time * 0.31 + j) * 12;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(midX, midY, bx, by);
        ctx.strokeStyle = dependencyLink
          ? `rgba(238, 188, 91, ${opacity})`
          : `rgba(111, 224, 248, ${opacity})`;
        ctx.lineWidth = Math.max(0.7, (dependencyLink ? 1.7 : 1.2) * Math.min(a.module.depth, b.module.depth));
        ctx.stroke();
      }
    }
  };

  const drawLooseFilaments = (visible, time) => {
    if (visible.length < 2) return;
    for (const entry of visible) {
      const module = entry.module;
      if (module.id % 3 !== 0) continue;
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
      const connectStart = 0.68;
      const connectEnd = 0.90;
      const early = Math.min(1, progress / connectStart);
      const attach = Math.max(0, Math.min(1, (progress - connectStart) / (connectEnd - connectStart)));
      const reach = progress < connectStart
        ? 0.22 + early * 0.42
        : 0.64 + attach * 0.36;
      const dotX = mix(startX, targetX, reach) + Math.sin(time * 1.7 + module.id) * (1 - attach) * 18;
      const dotY = mix(startY, targetY, reach) + Math.cos(time * 1.3 + module.id) * (1 - attach) * 12;
      const glow = progress < connectStart ? 0.34 + early * 0.18 : 0.52 + attach * 0.38;
      const fade = progress > connectEnd ? 1 - (progress - connectEnd) / (0.96 - connectEnd) : 1;

      ctx.save();
      ctx.globalAlpha = Math.max(0, fade);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const midX = (startX + dotX) / 2 + Math.sin(time + module.id) * 18;
      const midY = (startY + dotY) / 2 + Math.cos(time * 0.8 + module.id) * 10;
      ctx.quadraticCurveTo(midX, midY, dotX, dotY);
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
  };

  const drawText = (module, x, y, time) => {
    const alpha = 0.52 + module.depth * 0.32;
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
      const value = metricValue(label, module, i, time);
      const text = `${label}:${value}`.slice(0, 18);
      ctx.fillStyle = `rgba(214, 252, 255, ${Math.min(0.92, alpha)})`;
      ctx.fillText(text, x + 10 * module.depth, y + 24 * module.depth + lineH * (i + 1));
      const barW = (module.width - 22 * module.depth) * (0.22 + seeded(module.id + i * 10) * 0.55);
      ctx.fillStyle = `rgba(68, 226, 248, ${0.18 + alpha * 0.28})`;
      ctx.fillRect(x + 10 * module.depth, y + 24 * module.depth + lineH * (i + 1) + 5, barW, Math.max(1, 1.2 * module.depth));
    }
  };

  const metricValue = (label, module, rowIndex, time) => {
    const metrics = module.metrics;
    const drift = cycle(time * 0.055 + module.phase + rowIndex * 0.08);
    if (label === "STAGE") return metrics.stage;
    if (label === "RAG") return metrics.rag;
    if (label === "OWNER") return metrics.owner;
    if (label === "PRIOR") return metrics.priority;
    if (label === "SCORE") return `${Math.round(metrics.score + drift * 2)}/100`;
    if (label === "BUD" || label === "COST" || label === "FUND") return `$${metrics.budget}M`;
    if (label === "VALUE" || label === "BV") return `$${metrics.value}M`;
    if (label === "DEP") return `${String(metrics.deps).padStart(2, "0")} ${module.dependencyCluster}`;
    if (label === "DEC") return `${metrics.decisions} DUE`;
    if (label === "READY") return `${Math.round(metrics.ready + drift * 5)}%`;
    if (label === "FORE") return `${Math.round(metrics.forecast + drift * 4)}%`;
    if (label === "MILE") return metrics.milestone;
    if (label === "BEN") return metrics.benefit;
    if (label === "OUT") return `${Math.round(metrics.forecast + drift * 4)}%`;
    if (label === "ROI") return `${metrics.roi}X`;
    if (label === "CAP") return `${metrics.capacity} FTE`;
    if (label === "RISK") return metrics.risk;
    if (label === "ALIGN") return metrics.alignment;
    if (label === "GATE") return metrics.stage === "GATE" ? "OPEN" : "NEXT";
    return "";
  };

  const drawModule = (entry, time) => {
    const { module, x, y } = entry;
    const cyan = module.tone > 0.66;
    const gold = module.tone < 0.24;
    const edgeColor = gold ? "rgba(238, 188, 91," : cyan ? "rgba(67, 226, 249," : "rgba(118, 168, 255,";
    const fill = gold
      ? `rgba(62, 50, 24, ${0.30 + module.depth * 0.18})`
      : `rgba(12, 76, 119, ${0.30 + module.depth * 0.20})`;

    ctx.save();
    ctx.globalAlpha = Math.min(1, 0.68 + module.depth * 0.32);
    ctx.shadowBlur = 26 * module.depth;
    ctx.shadowColor = gold ? "rgba(248, 196, 90, 0.56)" : "rgba(54, 225, 248, 0.64)";
    roundRect(x, y, module.width, module.height, 10 * module.depth);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = `${edgeColor} ${0.38 + module.depth * 0.22})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = module.metrics.rag === "RED"
      ? "rgba(246, 124, 124, 0.72)"
      : module.metrics.rag === "AMBER"
        ? "rgba(248, 204, 108, 0.76)"
        : "rgba(118, 230, 184, 0.68)";
    ctx.fillRect(x, y, Math.max(3, 4 * module.depth), module.height);
    ctx.shadowBlur = 0;
    drawText(module, x, y, time);
    ctx.restore();

    const pulse = 0.45 + Math.sin(time * 1.3 + module.phase * 6.28) * 0.25;
    ctx.beginPath();
    ctx.arc(x + module.width * 0.88, y + module.height * 0.20, 2.5 * module.depth, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(154, 246, 255, ${pulse * 0.94})`;
    ctx.fill();
  };

  const draw = () => {
    const rawTime = (performance.now() - state.start) / 1000;
    const time = reduceMotion ? rawTime * 0.16 : rawTime;
    state.pointerX = mix(state.pointerX, state.targetX, 0.05);
    state.pointerY = mix(state.pointerY, state.targetY, 0.05);
    state.scroll = mix(state.scroll, window.scrollY || 0, 0.06);

    ctx.clearRect(0, 0, state.width, state.height);
    drawAtmosphere(time);

    const visible = state.modules
      .map((module) => ({ module, ...modulePosition(module, time) }))
      .filter((entry) => entry.x > -entry.module.width - 80 && entry.x < state.width + 100)
      .sort((a, b) => a.module.depth - b.module.depth);

    drawLooseFilaments(visible, time);
    drawFilaments(visible, time);
    for (const entry of visible) drawModule(entry, time);

    requestAnimationFrame(draw);
  };

  const onPointerMove = (event) => {
    const rect = hero.getBoundingClientRect();
    state.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    state.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
}
