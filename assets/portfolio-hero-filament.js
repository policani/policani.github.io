(function () {
  const host = document.querySelector(".portfolio-hero-filament-bg");
  if (!host || !window.PortfolioSignalField) return;

  window.PortfolioSignalField.create(host, {
    backgroundStart: "#1a1a1a",
    backgroundEnd: "#000061",
    gradientTopLeft: "#1a1a1a",
    gradientTopRight: "#000061",
    gradientBottomLeft: "#003b8f",
    gradientBottomRight: "#000026",
    gradientOpacity: 100,
    backgroundImage: "",
    cardCount: 72,
    cardMin: 8,
    cardMax: 72,
    speed: 1.55,
    brightness: 0.95,
    filamentDensity: 1.6,
    looseFilaments: 0.75,
    cardScale: 0.8,
    cardDepth: 1.18,
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
  });
}());
