// Generates the animated SVGs used by README.md.
// Run: node scripts/build-assets.mjs
// SVGs use CSS + SMIL animation, which GitHub renders inside <img>.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(out, { recursive: true });

const C = {
  bg0: "#061017",
  bg1: "#0a1f28",
  ink: "#e8f6fa",
  sub: "#9fb7c0",
  body: "#c9dde3",
  dim: "#5f7d88",
  line: "#16323c",
  accent: "#35d3ff",
  green: "#70f0b1",
};
const SANS = `'Segoe UI', -apple-system, BlinkMacSystemFont, Inter, Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, Consolas, Menlo, monospace`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const baseStyle = `
  .sans{font-family:${SANS}} .mono{font-family:${MONO}}
  .up{opacity:0;animation:up .9s cubic-bezier(.2,.7,.2,1) forwards}
  @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .glint{fill:none;stroke-linecap:round;stroke-dasharray:16 400;animation:glint 3.2s linear infinite}
  @keyframes glint{from{stroke-dashoffset:16}to{stroke-dashoffset:-400}}
  @media (prefers-reduced-motion: reduce){*{animation:none!important}.up{opacity:1}}
`;

const defs = (extra = "") => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg0}"/><stop offset=".55" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg0}"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="${C.accent}"/><stop offset="1" stop-color="${C.green}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${C.accent}" stroke-opacity=".06"/>
      <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="40 40" dur="12s" repeatCount="indefinite"/>
    </pattern>
    ${extra}
  </defs>`;

const frame = (w, h) => `
  <rect width="${w}" height="${h}" rx="22" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" rx="22" fill="url(#grid)"/>
  <rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="21.5" fill="none" stroke="${C.accent}" stroke-opacity=".18"/>`;

const svg = (w, h, body, extraDefs = "", extraStyle = "") => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <style>${baseStyle}${extraStyle}</style>${defs(extraDefs)}${frame(w, h)}
${body}
</svg>
`;

/* ---------- Header ---------- */
function header() {
  const W = 1200, H = 400;
  const layers = [
    [800, [120, 200, 280]],
    [915, [90, 160, 240, 310]],
    [1030, [130, 270]],
    [1120, [200]],
  ].map(([x, ys]) => ys.map((y) => ({ x, y })));

  let edges = "", glints = "", n = 0;
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of layers[l]) for (const b of layers[l + 1]) {
      const d = `M${a.x} ${a.y}L${b.x} ${b.y}`;
      edges += `<path d="${d}" stroke="${C.accent}" stroke-opacity=".16"/>`;
      glints += `<path class="glint" d="${d}" stroke="${n % 3 ? C.accent : C.green}" stroke-width="2.2" style="animation-delay:${((n * 0.37) % 3.2).toFixed(2)}s"/>`;
      n++;
    }
  }
  let nodes = "", k = 0;
  for (const layer of layers) for (const p of layer) {
    const col = p.x === 1120 ? C.green : C.accent;
    const delay = (k++ * 0.45).toFixed(2);
    nodes += `
    <circle cx="${p.x}" cy="${p.y}" r="9" fill="none" stroke="${col}" stroke-opacity=".6">
      <animate attributeName="r" values="9;22" dur="2.8s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".6;0" dur="2.8s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${p.x}" cy="${p.y}" r="7" fill="${C.bg0}" stroke="${col}" stroke-width="2"/>
    <circle cx="${p.x}" cy="${p.y}" r="3" fill="${col}"/>`;
  }

  const glow = `<radialGradient id="glow" cx="80%" cy="50%" r="45%">
      <stop offset="0" stop-color="${C.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="${C.ink}"/><stop offset=".45" stop-color="${C.ink}"/>
      <stop offset=".7" stop-color="${C.accent}"/><stop offset="1" stop-color="${C.green}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;-1 0" dur="9s" repeatCount="indefinite"/>
    </linearGradient>`;

  const body = `
  <rect width="${W}" height="${H}" rx="22" fill="url(#glow)"/>
  <g stroke-width="1.2">${edges}</g>
  <g>${glints}</g>
  <g>${nodes}</g>

  <g class="sans">
    <text class="mono up" x="72" y="104" font-size="15" letter-spacing="4" fill="${C.accent}" style="animation-delay:.1s">AA / AI SYSTEMS</text>
    <text class="up" x="70" y="178" font-size="62" font-weight="700" fill="url(#sweep)" style="animation-delay:.25s">Adeoluwa Adelugba</text>
    <text class="up" x="72" y="224" font-size="22" fill="${C.sub}" style="animation-delay:.45s">Senior AI Engineer  ·  GenAI  ·  MLOps  ·  Agentic AI</text>
    <text class="up" x="72" y="266" font-size="17" fill="${C.body}" style="animation-delay:.6s">I build dependable AI systems that move from prototype to production.</text>

    <g class="up" style="animation-delay:.8s">
      <rect x="72" y="300" width="318" height="36" rx="18" fill="${C.green}" fill-opacity=".08" stroke="${C.green}" stroke-opacity=".45"/>
      <circle cx="94" cy="318" r="5" fill="${C.green}">
        <animate attributeName="opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite"/>
      </circle>
      <text x="108" y="323" font-size="14" fill="${C.ink}">Open to senior AI engineering roles</text>
      <rect x="404" y="300" width="214" height="36" rx="18" fill="${C.accent}" fill-opacity=".06" stroke="${C.accent}" stroke-opacity=".35"/>
      <text x="426" y="323" font-size="14" fill="${C.ink}">North East England, UK</text>
    </g>
  </g>`;
  return svg(W, H, body, glow);
}

/* ---------- Lifecycle strip ---------- */
function lifecycle() {
  const W = 1200, H = 210, Y = 100, DUR = 7;
  const stages = [
    ["Discover", "use case and risk"],
    ["Design", "ADR · HLD · LLD"],
    ["Build", "RAG · agents · APIs"],
    ["Evaluate", "accuracy gates"],
    ["Ship", "CI/CD · blue-green"],
    ["Observe", "monitoring · drift"],
  ];
  const x0 = 110, step = 196;
  const xs = stages.map((_, i) => x0 + i * step);
  const xEnd = xs[xs.length - 1];
  const travel = (DUR - 1) / DUR; // dot reaches the end at t=DUR-1, then rests

  let nodes = "";
  stages.forEach(([t, s], i) => {
    const begin = (i * (DUR - 1)) / (stages.length - 1);
    const kt = `0;${(0.4 / DUR).toFixed(3)};${(1.6 / DUR).toFixed(3)};1`;
    nodes += `
    <circle cx="${xs[i]}" cy="${Y}" r="13" fill="${C.bg0}" stroke="${C.accent}" stroke-opacity=".5" stroke-width="2">
      <animate attributeName="stroke-opacity" values=".5;1;.5;.5" keyTimes="${kt}" dur="${DUR}s" begin="${begin.toFixed(2)}s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${xs[i]}" cy="${Y}" r="5" fill="${C.accent}">
      <animate attributeName="r" values="5;9;5;5" keyTimes="${kt}" dur="${DUR}s" begin="${begin.toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="fill" values="${C.accent};${C.green};${C.accent};${C.accent}" keyTimes="${kt}" dur="${DUR}s" begin="${begin.toFixed(2)}s" repeatCount="indefinite"/>
    </circle>
    <text class="sans" x="${xs[i]}" y="${Y + 46}" text-anchor="middle" font-size="19" font-weight="600" fill="${C.ink}">${t}</text>
    <text class="mono" x="${xs[i]}" y="${Y + 70}" text-anchor="middle" font-size="13.5" fill="${C.sub}">${esc(s)}</text>`;
  });

  const body = `
  <text class="mono" x="40" y="44" font-size="13" letter-spacing="3" fill="${C.accent}">HOW I DELIVER  ·  PROTOTYPE → PRODUCTION</text>
  <path d="M${xs[0]} ${Y}H${xEnd}" stroke="${C.line}" stroke-width="3"/>
  <path d="M${xs[0]} ${Y}H${xEnd}" stroke="url(#brand)" stroke-width="3" stroke-dasharray="${xEnd - xs[0]}" stroke-dashoffset="${xEnd - xs[0]}">
    <animate attributeName="stroke-dashoffset" values="${xEnd - xs[0]};0;0;${xEnd - xs[0]}" keyTimes="0;${travel.toFixed(3)};${((DUR - 0.25) / DUR).toFixed(3)};1" dur="${DUR}s" repeatCount="indefinite"/>
  </path>
  ${nodes}
  <circle r="6" fill="${C.green}">
    <animateMotion path="M${xs[0]} ${Y}H${xEnd}" keyPoints="0;1;1" keyTimes="0;${travel.toFixed(3)};1" calcMode="linear" dur="${DUR}s" repeatCount="indefinite"/>
  </circle>`;
  return svg(W, H, body);
}

/* ---------- Project cards ---------- */
function card({ file, eyebrow, title, lines, flow, tags }) {
  const W = 600, H = 320;
  const bw = 118, gap = 26, x0 = 32, fy = 186;
  let flowSvg = "";
  flow.forEach((label, i) => {
    const x = x0 + i * (bw + gap);
    const last = i === flow.length - 1;
    flowSvg += `
    <rect x="${x}" y="${fy}" width="${bw}" height="42" rx="10" fill="${last ? C.green : C.accent}" fill-opacity=".07" stroke="${last ? C.green : C.accent}" stroke-opacity=".5">
      <animate attributeName="stroke-opacity" values=".35;.9;.35" dur="4s" begin="${i}s" repeatCount="indefinite"/>
    </rect>
    <text class="mono" x="${x + bw / 2}" y="${fy + 26}" text-anchor="middle" font-size="13" fill="${C.ink}">${esc(label)}</text>`;
    if (!last) {
      const ax = x + bw + 3, bx = x + bw + gap - 3, y = fy + 21;
      flowSvg += `
    <path d="M${ax} ${y}H${bx}" stroke="${C.dim}" stroke-width="1.5"/>
    <circle r="3" fill="${C.green}">
      <animateMotion path="M${ax} ${y}H${bx}" dur="1s" begin="${i}s" repeatCount="indefinite"/>
    </circle>`;
    }
  });

  let tx = 32, tagSvg = "";
  for (const t of tags) {
    const w = Math.round(t.length * 7.9 + 26);
    tagSvg += `<rect x="${tx}" y="252" width="${w}" height="28" rx="14" fill="${C.bg0}" stroke="${C.line}"/>
    <text class="mono" x="${tx + w / 2}" y="270" text-anchor="middle" font-size="13" fill="${C.sub}">${esc(t)}</text>`;
    tx += w + 8;
  }

  const body = `
  <text class="mono up" x="32" y="48" font-size="12" letter-spacing="3" fill="${C.accent}">${esc(eyebrow)}</text>
  <text class="sans up" x="32" y="88" font-size="28" font-weight="700" fill="${C.ink}" style="animation-delay:.15s">${esc(title)}</text>
  <g class="sans up" font-size="16.5" fill="${C.body}" style="animation-delay:.3s">
    ${lines.map((l, i) => `<text x="32" y="${126 + i * 25}">${esc(l)}</text>`).join("\n    ")}
  </g>
  <g class="up" style="animation-delay:.45s">${flowSvg}</g>
  <g class="up" style="animation-delay:.6s">${tagSvg}</g>`;
  writeFileSync(join(out, file), svg(W, H, body));
}

/* ---------- Footer ---------- */
function footer() {
  const W = 1200, H = 120;
  const wave = (amp, phase) => {
    let d = `M0 ${60 + amp * Math.sin(phase)}`;
    for (let x = 20; x <= W; x += 20) d += `L${x} ${(60 + amp * Math.sin(x / 90 + phase)).toFixed(1)}`;
    return d;
  };
  const body = `
  <path d="${wave(14, 0)}" fill="none" stroke="url(#brand)" stroke-width="2" stroke-opacity=".7">
    <animate attributeName="d" values="${wave(14, 0)};${wave(14, Math.PI)};${wave(14, 0)}" dur="6s" repeatCount="indefinite"/>
  </path>
  <path d="${wave(9, 1)}" fill="none" stroke="${C.accent}" stroke-width="1.2" stroke-opacity=".3">
    <animate attributeName="d" values="${wave(9, 1)};${wave(9, 1 - Math.PI)};${wave(9, 1)}" dur="8s" repeatCount="indefinite"/>
  </path>
  <rect x="440" y="40" width="320" height="40" rx="20" fill="${C.bg0}" stroke="${C.accent}" stroke-opacity=".35"/>
  <text class="sans" x="600" y="66" text-anchor="middle" font-size="16" fill="${C.ink}">Thanks for stopping by</text>`;
  return svg(W, H, body);
}

writeFileSync(join(out, "header.svg"), header());
writeFileSync(join(out, "lifecycle.svg"), lifecycle());
writeFileSync(join(out, "footer.svg"), footer());

card({
  file: "project-rag.svg",
  eyebrow: "ENTERPRISE GENAI",
  title: "Enterprise RAG Assistant Platform",
  lines: [
    "Governed retrieval that turns scattered enterprise knowledge",
    "into grounded answers, with a source cited for every claim.",
  ],
  flow: ["Documents", "Chunk + embed", "AI Search", "Cited answer"],
  tags: ["Azure OpenAI", "AI Search", "Databricks", "ADLS"],
});
card({
  file: "project-claims.svg",
  eyebrow: "AGENTIC AI · INSURANCE",
  title: "Agentic Claims Assessment",
  lines: [
    "An orchestrator and specialist agents collect, validate and",
    "structure a claim, with humans in the loop where it matters.",
  ],
  flow: ["Customer", "Orchestrator", "Specialists", "Human review"],
  tags: ["AI Foundry", "Copilot Studio", "HITL", "APIs"],
});
card({
  file: "project-vehicle.svg",
  eyebrow: "MULTI-AGENT SYSTEMS",
  title: "Multi-Agent Vehicle Classification",
  lines: [
    "Specialist agents, third-party data and served ML models,",
    "coordinated with traceable decisions and explicit failure paths.",
  ],
  flow: ["Request", "Orchestrator", "Model serving", "Valid label"],
  tags: ["Databricks", "MLflow", "REST APIs", "Python"],
});
card({
  file: "project-idp.svg",
  eyebrow: "DOCUMENT INTELLIGENCE",
  title: "Document Processing & Validation",
  lines: [
    "Classification and structured extraction, backed by business",
    "rules, so AI output is never trusted by default.",
  ],
  flow: ["Document", "Classify", "Extract", "Rule check"],
  tags: ["Document AI", "Azure", "Python", "Validation"],
});

console.log("assets written to", out);
