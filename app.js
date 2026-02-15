// =====================
// TAP TABLES
// =====================
const taps = {
  "Metric": {
    "M3 x 0.5":  { major: 3.0, pitch: 0.5 },
    "M4 x 0.7":  { major: 4.0, pitch: 0.7 },
    "M5 x 0.8":  { major: 5.0, pitch: 0.8 },
    "M6 x 1.0":  { major: 6.0, pitch: 1.0 },
    "M8 x 1.25": { major: 8.0, pitch: 1.25 },
    "M10 x 1.5": { major: 10.0, pitch: 1.5 },
    "M12 x 1.75":{ major: 12.0, pitch: 1.75 }
  },
  "UNC": {
    "#6-32":   { major: 3.51, pitch: 0.7938 },
    "#8-32":   { major: 4.17, pitch: 0.7938 },
    "#10-24":  { major: 4.83, pitch: 1.058 },
    "1/4-20":  { major: 6.35, pitch: 1.27 },
    "5/16-18": { major: 7.94, pitch: 1.411 },
    "3/8-16":  { major: 9.53, pitch: 1.587 }
  },
  "UNF": {
    "#10-32":  { major: 4.83, pitch: 0.7938 },
    "1/4-28":  { major: 6.35, pitch: 0.907 },
    "5/16-24": { major: 7.94, pitch: 1.058 },
    "3/8-24":  { major: 9.53, pitch: 1.058 }
  }
};

// =====================
// DRILL STANDARDS (REAL)
// =====================
const drills = [
  // Metric
  { label: "2.5 mm", mm: 2.5 }, { label: "3.3 mm", mm: 3.3 },
  { label: "4.2 mm", mm: 4.2 }, { label: "4.3 mm", mm: 4.3 },
  { label: "5.0 mm", mm: 5.0 }, { label: "5.1 mm", mm: 5.1 },
  { label: "6.8 mm", mm: 6.8 }, { label: "8.5 mm", mm: 8.5 },
  { label: "10.2 mm", mm: 10.2 },

  // Number
  { label: "#40", mm: 2.49 }, { label: "#36", mm: 2.74 },
  { label: "#29", mm: 3.45 }, { label: "#21", mm: 3.73 },
  { label: "#17", mm: 4.496 }, { label: "#7", mm: 5.105 },
  { label: "#3", mm: 5.817 },

  // Fractional
  { label: "1/8\"", mm: 3.175 },
  { label: "11/64\"", mm: 4.366 },
  { label: "13/64\"", mm: 5.159 },
  { label: "17/64\"", mm: 6.747 },
  { label: "21/64\"", mm: 8.334 },
  { label: "13/32\"", mm: 10.32 }
];

// =====================
// MATERIAL TARGETS
// =====================
const targets = {
  "Aluminum":   [68, 72],
  "Mild Steel": [65, 68],
  "Stainless":  [60, 65]
};

// =====================
// UI
// =====================
const tapSelect = document.getElementById("tapSelect");
const materialSelect = document.getElementById("materialSelect");
const output = document.getElementById("output");

// =====================
// INIT
// =====================
function init() {
  tapSelect.innerHTML = "";

  Object.keys(taps).forEach(group => {
    const optGroup = document.createElement("optgroup");
    optGroup.label = group;

    Object.keys(taps[group]).forEach(t => {
      const opt = document.createElement("option");
      opt.value = `${group}|${t}`;
      opt.textContent = t;
      optGroup.appendChild(opt);
    });

    tapSelect.appendChild(optGroup);
  });

  render();
}

// =====================
// CALC
// =====================
function engagement(tap, drill) {
  return ((tap.major - drill.mm) / tap.pitch) * 100;
}

// =====================
// RENDER
function render() {
  const [group, tapName] = tapSelect.value.split("|");
  const tap = taps[group][tapName];
  const mat = materialSelect.value;
  const [low, high] = targets[mat];
  const targetMid = (low + high) / 2;

  // Calculate engagement and filter acceptable
  const acceptable = drills
    .map(d => ({
      ...d,
      eng: engagement(tap, d),
      type: drillType(d.label)
    }))
    .filter(d => d.eng >= low && d.eng <= high);

  // Best per drill type
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

  // Overall best
  const overallBest = Object.values(bestByType).sort(
    (a, b) => Math.abs(a.eng - targetMid) - Math.abs(b.eng - targetMid)
  )[0];

  // Render
  let html = `<h3>Recommended Drill Options</h3>`;

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
      Target Engagement: ${low}–${high}% (${mat}, hand tapping)
    </div>`;

  output.innerHTML = html;
}
