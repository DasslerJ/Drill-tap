// ==============================
// MATERIAL TARGET ENGAGEMENTS
// ==============================
const targets = {
  Aluminum: [65, 75],
  "Mild Steel": [65, 68],
  Stainless: [60, 65]
};

// ==============================
// TAP DATA
// ==============================
const taps = {
  Metric: {
    "M3 × 0.5": { major: 3.0, pitch: 0.5 },
    "M4 × 0.7": { major: 4.0, pitch: 0.7 },
    "M5 × 0.8": { major: 5.0, pitch: 0.8 },
    "M6 × 1.0": { major: 6.0, pitch: 1.0 },
    "M8 × 1.25": { major: 8.0, pitch: 1.25 },
    "M10 × 1.5": { major: 10.0, pitch: 1.5 }
  },
  Inch: {
    "#6-32 UNC": { major: 3.505, pitch: 25.4 / 32 },
    "#8-32 UNC": { major: 4.166, pitch: 25.4 / 32 },
    "#10-24 UNC": { major: 4.826, pitch: 25.4 / 24 },
    "#10-32 UNF": { major: 4.826, pitch: 25.4 / 32 },
    "1/4-20 UNC": { major: 6.35, pitch: 25.4 / 20 },
    "1/4-28 UNF": { major: 6.35, pitch: 25.4 / 28 },
    "5/16-18 UNC": { major: 7.94, pitch: 25.4 / 18 },
    "5/16-24 UNF": { major: 7.94, pitch: 25.4 / 24 }
  }
};

// ==============================
// DRILL TABLES (REAL SIZES)
// ==============================
const drills = [
  // Metric
  { label: "2.5 mm", dia: 2.5 },
  { label: "3.3 mm", dia: 3.3 },
  { label: "4.2 mm", dia: 4.2 },
  { label: "5.0 mm", dia: 5.0 },
  { label: "6.8 mm", dia: 6.8 },
  { label: "8.5 mm", dia: 8.5 },

  // Number
  { label: "#36", dia: 2.743 },
  { label: "#30", dia: 3.264 },
  { label: "#19", dia: 4.216 },
  { label: "#7", dia: 5.105 },
  { label: "#3", dia: 5.791 },
  { label: "F", dia: 6.528 },

  // Fractional
  { label: "7/64\"", dia: 2.778 },
  { label: "1/8\"", dia: 3.175 },
  { label: "11/64\"", dia: 4.366 },
  { label: "13/64\"", dia: 5.159 },
  { label: "17/64\"", dia: 6.747 },
  { label: "21/64\"", dia: 8.334 }
];

// ==============================
// UI ELEMENTS
// ==============================
const tapSelect = document.getElementById("tap");
const materialSelect = document.getElementById("material");
const output = document.getElementById("output");

// ==============================
// INIT DROPDOWNS
// ==============================
function init() {
  for (const group in taps) {
    const optGroup = document.createElement("optgroup");
    optGroup.label = group;

    for (const tap in taps[group]) {
      const opt = document.createElement("option");
      opt.value = `${group}|${tap}`;
      opt.textContent = tap;
      optGroup.appendChild(opt);
    }
    tapSelect.appendChild(optGroup);
  }

  render();
}

tapSelect.addEventListener("change", render);
materialSelect.addEventListener("change", render);

// ==============================
// CALCULATIONS
// ==============================
function engagement(tap, drill) {
  return ((tap.major - drill.dia) / tap.pitch) * 100;
}

function drillType(label) {
  if (label.includes("mm")) return "Metric";
  if (label.includes("#")) return "Number";
  return "Fractional";
}

// ==============================
// RENDER OUTPUT
// ==============================
function render() {
  const [group, tapName] = tapSelect.value.split("|");
  const tap = taps[group][tapName];
  const material = materialSelect.value;
  const [low, high] = targets[material];
  const targetMid = (low + high) / 2;

  const acceptable = drills
    .map(d => ({
      ...d,
      eng: engagement(tap, d),
      type: drillType(d.label)
    }))
    .filter(d => d.eng >= low && d.eng <= high);

  const bestByType = {};
  acceptable.forEach(d => {
    if (
      !bestByType[d.type] ||
      Math.abs(d.eng - targetMid) <
      Math.abs(bestByType[d.type].eng - targetMid)
    ) {
      bestByType[d.type] = d;
    }
  });

  const overallBest = Object.values(bestByType).sort(
    (a, b) => Math.abs(a.eng - targetMid) - Math.abs(b.eng - targetMid)
  )[0];

  let html = `<h3>Recommended Drill Sizes</h3>`;

  ["Metric", "Number", "Fractional"].forEach(type => {
    if (!bestByType[type]) return;

    const d = bestByType[type];
    const star = d === overallBest ? "★ " : "";

    html += `
      <div class="${d === overallBest ? "best" : "option"}">
        ${star}${type}: ${d.label} → ${d.eng.toFixed(1)}%
      </div>`;
  });

  html += `
    <div class="target">
      Target Engagement: ${low}–${high}% (${material}, hand tapping)
    </div>`;

  output.innerHTML = html;
}

// ==============================
init();
