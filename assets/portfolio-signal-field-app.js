(function () {
  const defaults = window.PortfolioSignalField.defaultConfig;
  const host = document.getElementById("signalField");
  const output = document.getElementById("configOutput");
  const statusLine = document.getElementById("statusLine");
  const cardsJson = document.getElementById("cardsJson");
  const metricRowsJson = document.getElementById("metricRowsJson");
  const rangeIds = ["cardScale", "cardDepth", "speed", "brightness", "filamentDensity", "looseFilaments", "gradientOpacity"];
  const colorIds = ["gradientTopLeft", "gradientTopRight", "gradientBottomLeft", "gradientBottomRight"];
  let instance = window.PortfolioSignalField.create(host, defaults);
  let currentConfig = structuredClone(defaults);

  const setStatus = (message, tone = "ok") => {
    statusLine.textContent = message;
    statusLine.style.color = tone === "error" ? "#b42318" : "#2f9ab3";
  };

  const toJson = (value) => JSON.stringify(value, null, 2);

  const syncRangeLabel = (id) => {
    const input = document.getElementById(id);
    const value = document.getElementById(`${id}Value`);
    value.textContent = id === "gradientOpacity" ? `${Math.round(Number(input.value))}%` : Number(input.value).toFixed(2);
  };

  const writeForm = (config) => {
    for (const id of colorIds) {
      document.getElementById(id).value = config[id];
    }
    document.getElementById("backgroundImage").value = config.backgroundImage || "";
    document.getElementById("cardCount").value = config.cardCount;
    document.getElementById("cardMin").value = config.cardMin;
    document.getElementById("cardMax").value = config.cardMax;
    document.getElementById("cardCount").min = config.cardMin;
    document.getElementById("cardCount").max = config.cardMax;
    for (const id of rangeIds) {
      document.getElementById(id).value = config[id];
      syncRangeLabel(id);
    }
    cardsJson.value = toJson(config.cards);
    metricRowsJson.value = toJson(config.metricRows);
    output.value = toJson(config);
  };

  const readForm = () => {
    const next = {
      ...currentConfig,
      gradientTopLeft: document.getElementById("gradientTopLeft").value,
      gradientTopRight: document.getElementById("gradientTopRight").value,
      gradientBottomLeft: document.getElementById("gradientBottomLeft").value,
      gradientBottomRight: document.getElementById("gradientBottomRight").value,
      backgroundImage: document.getElementById("backgroundImage").value.trim(),
      cardCount: Number(document.getElementById("cardCount").value),
      cardMin: Number(document.getElementById("cardMin").value),
      cardMax: Number(document.getElementById("cardMax").value),
      cardScale: Number(document.getElementById("cardScale").value),
      cardDepth: Number(document.getElementById("cardDepth").value),
      speed: Number(document.getElementById("speed").value),
      brightness: Number(document.getElementById("brightness").value),
      filamentDensity: Number(document.getElementById("filamentDensity").value),
      looseFilaments: Number(document.getElementById("looseFilaments").value),
      gradientOpacity: Number(document.getElementById("gradientOpacity").value)
    };
    next.cards = JSON.parse(cardsJson.value);
    next.metricRows = JSON.parse(metricRowsJson.value);
    return next;
  };

  const applyConfig = () => {
    try {
      currentConfig = readForm();
      instance.updateConfig(currentConfig);
      currentConfig = instance.exportConfig();
      const cardCount = document.getElementById("cardCount");
      cardCount.min = currentConfig.cardMin;
      cardCount.max = currentConfig.cardMax;
      cardCount.value = currentConfig.cardCount;
      output.value = toJson(currentConfig);
      setStatus("Configuration applied.");
    } catch (error) {
      setStatus(`Could not apply JSON: ${error.message}`, "error");
    }
  };

  document.getElementById("applyConfig").addEventListener("click", applyConfig);

  document.getElementById("resetConfig").addEventListener("click", () => {
    currentConfig = structuredClone(defaults);
    instance.updateConfig(currentConfig);
    writeForm(currentConfig);
    setStatus("Defaults restored.");
  });

  document.getElementById("copyConfig").addEventListener("click", async () => {
    output.value = toJson(instance.exportConfig());
    try {
      await navigator.clipboard.writeText(output.value);
      setStatus("Configuration copied.");
    } catch {
      output.focus();
      output.select();
      setStatus("Configuration selected for copying.");
    }
  });

  document.getElementById("saveConfig").addEventListener("click", () => {
    output.value = toJson(instance.exportConfig());
    const blob = new Blob([output.value], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "portfolio-signal-field-config.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("JSON file saved.");
  });

  for (const id of [...colorIds, "backgroundImage", "cardCount", "cardMin", "cardMax", ...rangeIds]) {
    document.getElementById(id).addEventListener("input", () => {
      if (rangeIds.includes(id)) syncRangeLabel(id);
      applyConfig();
    });
  }

  cardsJson.addEventListener("blur", applyConfig);
  metricRowsJson.addEventListener("blur", applyConfig);
  writeForm(currentConfig);
  setStatus("Ready.");
}());
