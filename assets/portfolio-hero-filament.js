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
    const count = compact() ? 16 : 32;
    const clusters = [
      { code: "APP", name: "App Delivery", y: 0.18, tone: 0.78 },
      { code: "API", name: "API Platform", y: 0.30, tone: 0.58 },
      { code: "DAT", name: "Data Platform", y: 0.43, tone: 0.42 },
      { code: "SEC", name: "Security", y: 0.56, tone: 0.68 },
      { code: "OPS", name: "DevOps", y: 0.68, tone: 0.18 },
      { code: "QAT", name: "Quality", y: 0.78, tone: 0.50 }
    ];
    const initiatives = [
      "Checkout Rewrite",
      "API Gateway",
      "Event Pipeline",
      "Identity Upgrade",
      "CI/CD Hardening",
      "Test Automation",
      "Mobile Release",
      "Service Mesh",
      "Data Lakehouse",
      "Secrets Rotation",
      "Deploy Pipeline",
      "Regression Suite",
      "Feature Flags",
      "Partner APIs",
      "Analytics Mart",
      "Vuln Remediation",
      "Observability",
      "Load Testing",
      "Billing Engine",
      "Integration Hub",
      "CDC Migration",
      "Access Reviews",
      "Release Train",
      "Synthetic Tests",
      "Search Service",
      "Webhook Platform",
      "ML Ops Runtime",
      "Zero Trust",
      "Cloud Cost Guard",
      "Contract Tests",
      "Entitlement API",
      "Data Quality"
    ];
    const phases = ["DISC", "DESIGN", "BUILD", "TEST", "UAT", "PROD"];
    const health = ["GREEN", "GREEN", "AMBER", "AMBER", "RED"];
    const owners = ["APP", "API", "DATA", "SRE", "SEC", "QA"];
    const rows = [
      ["PHASE", "RAG", "BUD", "DEP", "DEC", "READY"],
      ["OWNER", "PRIOR", "STORY", "FORE", "DEFECT", "MILE"],
      ["PHASE", "RAG", "CYCLE", "DEP", "READY", "COVER"],
      ["OWNER", "BUD", "VALUE", "ENV", "FORE", "MILE"]
    ];
    state.modules = Array.from({ length: count }, (_, index) => {
      const depth = 0.58 + seeded(index + 4) * 0.72;
      const cluster = clusters[index % clusters.length];
      const width = (132 + seeded(index + 8) * 86) * depth;
      const height = (82 + seeded(index + 11) * 34) * depth;
      const budget = (0.8 + seeded(index + 13) * 7.8).toFixed(1);
      const value = (1.2 + seeded(index + 14) * 12.5).toFixed(1);
      const deps = Math.max(1, Math.round(seeded(index + 15) * 9));
      const decisions = Math.max(0, Math.round(seeded(index + 16) * 4));
      const blockers = Math.max(0, Math.round(seeded(index + 17) * 3));
      const ready = Math.round(48 + seeded(index + 18) * 42);
      const forecast = Math.round(55 + seeded(index + 19) * 34);
      const cycleDays = Math.round(12 + seeded(index + 20) * 46);
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
          phase: phases[Math.floor(seeded(index + 21) * phases.length)],
          rag: health[Math.floor(seeded(index + 22) * health.length)],
          owner: owners[Math.floor(seeded(index + 23) * owners.length)],
          priority: `P${Math.max(1, Math.min(4, Math.ceil(seeded(index + 24) * 4)))}`,
          budget,
          value,
          deps,
          decisions,
          blockers,
          ready,
          forecast,
          cycleDays,
          milestone: `D+${Math.round(8 + seeded(index + 25) * 52)}`,
          benefit: `${Math.round(44 + seeded(index + 26) * 44)}%`,
          story: Math.round(18 + seeded(index + 27) * 130),
          coverage: `${Math.round(54 + seeded(index + 28) * 38)}%`,
          environment: ["DEV", "QA", "STAGE", "PROD"][Math.floor(seeded(index + 29) * 4)]
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
    glow.addColorStop(0, "rgba(46, 213, 238, 0.16)");
    glow.addColorStop(0.38, "rgba(39, 124, 236, 0.075)");
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
      ctx.strokeStyle = "rgba(123, 220, 245, 0.058)";
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
        const baseOpacity = sameCluster ? 0.24 : 0.34;
        const opacity = Math.min(baseOpacity + 0.04, (1 - distance / maxDistance) * (baseOpacity + 0.10)) * (0.68 + gate * 0.32);
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

  const drawText = (module, x, y, time) => {
    const alpha = 0.42 + module.depth * 0.28;
    const lineH = Math.max(9, (module.height - 22 * module.depth) / (module.rows.length + 1));
    const fontSize = Math.max(7, Math.round(8 * module.depth));
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(230, 251, 255, ${Math.min(0.88, alpha + 0.18)})`;
    ctx.fillText(module.code, x + 10 * module.depth, y + 12 * module.depth);
    ctx.fillStyle = `rgba(169, 226, 239, ${Math.min(0.74, alpha + 0.04)})`;
    ctx.fillText(module.title.toUpperCase().slice(0, 18), x + 10 * module.depth, y + 23 * module.depth);
    for (let i = 0; i < module.rows.length; i += 1) {
      const label = module.rows[i];
      const value = metricValue(label, module, i, time);
      const text = `${label}:${value}`.slice(0, 18);
      ctx.fillStyle = `rgba(196, 249, 255, ${alpha})`;
      ctx.fillText(text, x + 10 * module.depth, y + 24 * module.depth + lineH * (i + 1));
      const barW = (module.width - 22 * module.depth) * (0.22 + seeded(module.id + i * 10) * 0.55);
      ctx.fillStyle = `rgba(45, 215, 240, ${0.12 + alpha * 0.24})`;
      ctx.fillRect(x + 10 * module.depth, y + 24 * module.depth + lineH * (i + 1) + 5, barW, Math.max(1, 1.2 * module.depth));
    }
  };

  const metricValue = (label, module, rowIndex, time) => {
    const metrics = module.metrics;
    const drift = cycle(time * 0.055 + module.phase + rowIndex * 0.08);
    if (label === "PHASE") return metrics.phase;
    if (label === "RAG") return metrics.rag;
    if (label === "OWNER") return metrics.owner;
    if (label === "PRIOR") return metrics.priority;
    if (label === "BUD") return `$${metrics.budget}M`;
    if (label === "VALUE") return `$${metrics.value}M`;
    if (label === "DEP") return `${String(metrics.deps).padStart(2, "0")} ${module.dependencyCluster}`;
    if (label === "DEC") return `${metrics.decisions} DUE`;
    if (label === "BLOCK" || label === "DEFECT") return String(metrics.blockers).padStart(2, "0");
    if (label === "READY") return `${Math.round(metrics.ready + drift * 5)}%`;
    if (label === "FORE") return `${Math.round(metrics.forecast + drift * 4)}%`;
    if (label === "MILE") return metrics.milestone;
    if (label === "CYCLE") return `${Math.round(metrics.cycleDays + drift * 4)}D`;
    if (label === "BENEFIT") return metrics.benefit;
    if (label === "STORY") return `${metrics.story} PT`;
    if (label === "COVER") return metrics.coverage;
    if (label === "ENV") return metrics.environment;
    return "";
  };

  const drawModule = (entry, time) => {
    const { module, x, y } = entry;
    const cyan = module.tone > 0.66;
    const gold = module.tone < 0.24;
    const edgeColor = gold ? "rgba(238, 188, 91," : cyan ? "rgba(67, 226, 249," : "rgba(118, 168, 255,";
    const fill = gold
      ? `rgba(47, 38, 20, ${0.22 + module.depth * 0.14})`
      : `rgba(11, 55, 88, ${0.20 + module.depth * 0.15})`;

    ctx.save();
    ctx.globalAlpha = Math.min(0.98, 0.58 + module.depth * 0.31);
    ctx.shadowBlur = 21 * module.depth;
    ctx.shadowColor = gold ? "rgba(234, 176, 72, 0.40)" : "rgba(41, 214, 240, 0.48)";
    roundRect(x, y, module.width, module.height, 10 * module.depth);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = `${edgeColor} ${0.26 + module.depth * 0.16})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = module.metrics.rag === "RED"
      ? "rgba(240, 112, 112, 0.62)"
      : module.metrics.rag === "AMBER"
        ? "rgba(238, 188, 91, 0.64)"
        : "rgba(102, 218, 172, 0.56)";
    ctx.fillRect(x, y, Math.max(3, 4 * module.depth), module.height);
    ctx.shadowBlur = 0;
    drawText(module, x, y, time);
    ctx.restore();

    const pulse = 0.45 + Math.sin(time * 1.3 + module.phase * 6.28) * 0.25;
    ctx.beginPath();
    ctx.arc(x + module.width * 0.88, y + module.height * 0.20, 2.5 * module.depth, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(124, 239, 255, ${pulse * 0.84})`;
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
