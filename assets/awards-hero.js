(() => {
  const canvas = document.getElementById("operations-canvas");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!canvas || reducedMotion.matches) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const colors = {
    teal: "47, 127, 149",
    gold: "183, 137, 54",
    sage: "94, 118, 104",
    white: "255, 255, 255"
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const cubicPoint = (p0, p1, p2, p3, t) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
      x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
    };
  };

  const getRoutes = () => {
    const compact = width < 680;
    const driftX = pointerX * (compact ? 10 : 22);
    const driftY = pointerY * (compact ? 8 : 16);

    if (compact) {
      return [
        {
          color: colors.teal,
          delay: 0,
          points: [
            { x: width * 0.3 + driftX, y: height * 0.13 + driftY },
            { x: width * 0.48, y: height * 0.06 },
            { x: width * 0.78, y: height * 0.2 },
            { x: width * 1.14, y: height * 0.12 - driftY }
          ]
        },
        {
          color: colors.gold,
          delay: 0.28,
          points: [
            { x: width * 0.26 - driftX, y: height * 0.54 },
            { x: width * 0.5, y: height * 0.43 + driftY },
            { x: width * 0.72, y: height * 0.62 },
            { x: width * 1.16, y: height * 0.5 - driftY }
          ]
        },
        {
          color: colors.sage,
          delay: 0.56,
          points: [
            { x: width * 0.12, y: height * 0.78 - driftY },
            { x: width * 0.34 + driftX, y: height * 0.68 },
            { x: width * 0.76, y: height * 0.84 + driftY },
            { x: width * 1.08, y: height * 0.73 }
          ]
        }
      ];
    }

    return [
      {
        color: colors.teal,
        delay: 0,
        points: [
          { x: width * 0.34 + driftX, y: height * 0.33 },
          { x: width * 0.5, y: height * 0.2 + driftY },
          { x: width * 0.72, y: height * 0.42 },
          { x: width * 1.06, y: height * 0.28 - driftY }
        ]
      },
      {
        color: colors.gold,
        delay: 0.22,
        points: [
          { x: width * 0.26 - driftX, y: height * 0.54 },
          { x: width * 0.5, y: height * 0.44 - driftY },
          { x: width * 0.76, y: height * 0.64 },
          { x: width * 1.08, y: height * 0.53 + driftY }
        ]
      },
      {
        color: colors.sage,
        delay: 0.48,
        points: [
          { x: width * 0.38, y: height * 0.74 + driftY },
          { x: width * 0.56 + driftX, y: height * 0.66 },
          { x: width * 0.78, y: height * 0.83 - driftY },
          { x: width * 1.04, y: height * 0.73 }
        ]
      }
    ];
  };

  const drawPath = (route, alpha, widthScale = 1) => {
    const [p0, p1, p2, p3] = route.points;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.strokeStyle = `rgba(${route.color}, ${alpha})`;
    ctx.lineWidth = widthScale;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const drawPulse = (route, t, radius, alpha) => {
    const [p0, p1, p2, p3] = route.points;
    const point = cubicPoint(p0, p1, p2, p3, t);
    const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 5.2);
    glow.addColorStop(0, `rgba(${colors.white}, ${alpha})`);
    glow.addColorStop(0.22, `rgba(${route.color}, ${alpha * 0.95})`);
    glow.addColorStop(1, `rgba(${route.color}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 5.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${colors.white}, ${clamp(alpha + 0.12, 0, 1)})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawNode = (x, y, time, compact) => {
    const size = compact ? 28 : 42;
    const pulse = 0.88 + Math.sin(time * 2.4) * 0.12;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4 + Math.sin(time * 0.7) * 0.05);

    ctx.shadowColor = "rgba(183, 137, 54, 0.62)";
    ctx.shadowBlur = compact ? 20 : 34;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillStyle = "rgba(47, 127, 149, 0.24)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.rect(-size * pulse, -size * pulse, size * 2 * pulse, size * 2 * pulse);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 12;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.rect(-5, -5, 10, 10);
    ctx.fill();
    ctx.restore();
  };

  const render = (now) => {
    const time = now / 1000;
    const compact = width < 680;
    pointerX += (targetX - pointerX) * 0.045;
    pointerY += (targetY - pointerY) * 0.045;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const routes = getRoutes();
    routes.forEach((route, index) => {
      drawPath(route, compact ? 0.2 : 0.16, compact ? 6 : 8);
      drawPath(route, compact ? 0.58 : 0.46, compact ? 1.8 : 2.2);

      for (let pulse = 0; pulse < 3; pulse += 1) {
        const t = (time * (0.18 + index * 0.025) + route.delay + pulse * 0.34) % 1;
        drawPulse(route, t, compact ? 2.2 : 2.8, compact ? 0.78 : 0.72);
      }
    });

    const nodeX = compact ? width * 0.86 : width * 0.83;
    const nodeY = compact ? height * 0.5 : height * 0.5;
    drawNode(nodeX, nodeY, time, compact);

    ctx.globalCompositeOperation = "source-over";
    window.requestAnimationFrame(render);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    targetX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    targetY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
  }, { passive: true });

  resize();
  window.requestAnimationFrame(render);
})();
