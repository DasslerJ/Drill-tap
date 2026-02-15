// =====================
// TAP DEFINITIONS
// =====================
const taps = {
  // Metric Coarse
  "M2 x 0.4":  { major: 2.0,  pitch: 0.4 },
  "M2.5 x 0.45": { major: 2.5, pitch: 0.45 },
  "M3 x 0.5":  { major: 3.0,  pitch: 0.5 },
  "M4 x 0.7":  { major: 4.0,  pitch: 0.7 },
  "M5 x 0.8":  { major: 5.0,  pitch: 0.8 },
  "M6 x 1.0":  { major: 6.0,  pitch: 1.0 },
  "M8 x 1.25": { major: 8.0,  pitch: 1.25 },
  "M10 x 1.5": { major: 10.0, pitch: 1.5 },
  "M12 x 1.75":{ major: 12.0, pitch: 1.75 },

  // Metric Fine (common)
  "M6 x 0.75": { major: 6.0, pitch: 0.75 },
  "M8 x 1.0":  { major: 8.0, pitch: 1.0 },
  "M10 x 1.25":{ major: 10.0, pitch: 1.25 }
};

// =====================
// DRILL POOL (REALISTIC)
// =====================
const drills = [
  // Metric
  { label: "1.6 mm", mm: 1.6 },
  { label: "2.0 mm", mm: 2.0 },
  { label: "2.1 mm", mm: 2.1 },
  { label: "2.5 mm", mm: 2.5 },
  { label: "3.3 mm", mm: 3.3 },
  { label: "4.2 mm", mm: 4.2 },
  { label: "4.3 mm", mm: 4.3 },
  { label: "5.0 mm", mm: 5.0 },
  { label: "5.1 mm", mm: 5.1 },
  { label: "6.8 mm", mm: 6.8 },
  { label: "8.5 mm", mm: 8.5 },
  { label: "10.2 mm", mm: 10.2 },

  // Number drills
  { label: "#50", mm: 1.78 },
  { label: "#43", mm: 2.26 },
  { label: "#36", mm: 2.74 },
  { label: "#29", mm: 3.45 },
  { label: "#21", mm: 3.73 },
  { label: "#17", mm: 4.496 },
  { label: "#7",  mm: 5.105 },
  { label: "#3",  mm: 5.817 },

  // Fractional
  { label: "5/64\"",  mm: 1.984 },
  { label: "1/8\"",   mm: 3.175 },
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
// UI ELEMENTS
// =====================
const tapSelect = document.getElementById("tapSelect");
const materialSelect = document.getElementById("materialSelect");
const output = document.getElementById("output");

// =====================
// INIT
// =====================
function init() {
  tapSelect.innerHTML = "";

  Object.keys(taps).forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    tapSelect.appendChild(opt);
  });

  const lastTap = localStorage.getItem("tap");
  const lastMat = localStorage.getItem("mat");

  if (lastTap && taps[lastTap]) tapSelect.value = lastTap;
  if (lastMat) materialSelect.value = lastMat;

  render();
}

// =====================
// CALCULATIONS
// =====================
function engagement(tap, drill) {
  return Math.round(((tap.major - drill.mm) / tap.pitch) * 100);
}

// =====================
// RENDER
// =====================
function render() {
  const tapName = tapSelect.value;
  const mat = materialSelect.value;

  localStorage.setItem("tap", tapName);
  localStorage.setItem("mat", mat);

  const tap = taps[tapName];
  const [low, high] = targets[mat];

  const evaluated = drills
    .map(d => ({ ...d, eng: engagement(tap, d) }))
    .filter(d => d.eng > 45 && d.eng < 75)
    .sort((a, b) => a.eng - b.eng);

  const best = evaluated.find(d => d.eng >= low && d.eng <= high);

  let html = `<h3>Recommended Drill Options</h3>`;

  evaluated.forEach(d => {
    const isBest = d === best;
    html += `
      <div class="${isBest ? "best" : "option"}">
        ${isBest ? "★ " : ""}${d.label} → ${d.eng}% engagement
      </div>`;
  });

  html += `<div class="target">
    Target Engagement: ${low}–${high}% (Hand Tapping)
  </div>`;

  output.innerHTML = html;
}

tapSelect.onchange = render;
materialSelect.onchange = render;

init();
