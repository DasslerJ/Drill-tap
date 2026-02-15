const taps = {
  "M5 x 0.8": { major: 5.0, pitch: 0.8 }
};

const drills = [
  { label: "4.2 mm", mm: 4.2 },
  { label: "4.3 mm", mm: 4.3 },
  { label: "#17", mm: 4.496 },
  { label: "11/64\"", mm: 4.366 }
];

const targets = {
  "Aluminum": [68, 72],
  "Mild Steel": [65, 68],
  "Stainless": [60, 65]
};

const tapSelect = document.getElementById("tapSelect");
const materialSelect = document.getElementById("materialSelect");
const output = document.getElementById("output");

function init() {
  const lastTap = localStorage.getItem("tap") || "M5 x 0.8";
  const lastMat = localStorage.getItem("mat") || "Stainless";

  tapSelect.innerHTML = `<option>${lastTap}</option>`;
  materialSelect.value = lastMat;

  render();
}

function engagement(tap, drill) {
  return Math.round(((tap.major - drill.mm) / tap.pitch) * 100);
}

function render() {
  const tapName = tapSelect.value;
  const mat = materialSelect.value;

  localStorage.setItem("tap", tapName);
  localStorage.setItem("mat", mat);

  const tap = taps[tapName];
  const [low, high] = targets[mat];

  const evaluated = drills.map(d => ({
    ...d,
    eng: engagement(tap, d)
  })).filter(d => d.eng > 40 && d.eng < 80);

  evaluated.sort((a, b) => a.eng - b.eng);

  let best = evaluated.find(d => d.eng >= low && d.eng <= high);

  let html = `<h3>Recommended Drill Options</h3>`;

  evaluated.forEach(d => {
    const cls = d === best ? "best" : "option";
    const star = d === best ? "★ " : "";
    html += `<div class="${cls}">${star}${d.label} → ${d.eng}%</div>`;
  });

  html += `<div class="target">Target Engagement: ${low}–${high}% (Hand Tapping)</div>`;
  output.innerHTML = html;
}

tapSelect.onchange = render;
materialSelect.onchange = render;

init();
