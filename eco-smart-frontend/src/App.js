import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API = process.env.REACT_APP_API_URL ?? "http://localhost:8000";

const COLORS = {
  Metal: "#64748b",
  "Métal": "#64748b",
  Papier: "#d97706",
  Plastique: "#2563eb",
  Verre: "#059669",
};

const CATEGORY_MARKS = {
  Metal: "MT",
  "Métal": "MT",
  Papier: "PA",
  Plastique: "PL",
  Verre: "VE",
};

const INITIAL_VALUES = {
  poids: 50,
  volume: 100,
  conductivite: 0.1,
  opacite: 1,
  rigidite: 5,
};

const SLIDERS = [
  {
    key: "poids",
    label: "Poids",
    unit: "kg",
    min: 0,
    max: 300,
    step: 1,
    hint: "Masse du lot collecte",
  },
  {
    key: "volume",
    label: "Volume",
    unit: "L",
    min: 0,
    max: 530,
    step: 1,
    hint: "Espace occupe par le dechet",
  },
  {
    key: "conductivite",
    label: "Conductivite",
    unit: "",
    min: -0.31,
    max: 0.52,
    step: 0.01,
    hint: "Indice de reponse electrique",
  },
  {
    key: "opacite",
    label: "Opacite",
    unit: "",
    min: -0.91,
    max: 2.15,
    step: 0.01,
    hint: "Transparence du materiau",
  },
  {
    key: "rigidite",
    label: "Rigidite",
    unit: "",
    min: 1.5,
    max: 11,
    step: 0.1,
    hint: "Resistance mecanique",
  },
];

const NLP_EXAMPLES = [
  "Materiau metallique tres rigide et lourd, conducteur electrique, aspect brillant.",
  "Feuilles de papier et cartons souples, tres legers, aspect opaque, non conducteur.",
  "Conteneur plastique semi-rigide, leger, faible conductivite, usage alimentaire.",
  "Bris de verre transparents, rigides, conductivite moderee, provenance menagere.",
];

const TAB_HASHES = ["dashboard", "prediction", "nlp"];

const styles = `
  * { box-sizing: border-box; }

  :root {
    --bg: #f5f7f4;
    --surface: #ffffff;
    --surface-soft: #eef3ee;
    --ink: #17211b;
    --muted: #647067;
    --line: #dce5dc;
    --line-strong: #c7d5ca;
    --green: #167a4a;
    --green-strong: #0f6a3f;
    --blue: #245f9d;
    --amber: #b86d12;
    --danger: #b42318;
    --shadow: 0 18px 45px rgba(35, 54, 42, 0.08);
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }

  button,
  input,
  textarea {
    font: inherit;
  }

  button {
    border: 0;
  }

  .app {
    min-height: 100vh;
  }

  .topbar {
    border-bottom: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(14px);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .topbar-inner {
    align-items: center;
    display: flex;
    gap: 20px;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 1180px;
    padding: 16px 24px;
  }

  .brand {
    align-items: center;
    display: flex;
    gap: 12px;
    min-width: 0;
  }

  .brand-mark {
    align-items: center;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.18), transparent 45%),
      #153824;
    border-radius: 8px;
    color: #d8ffe7;
    display: inline-flex;
    flex-direction: column;
    font-size: 10px;
    font-weight: 800;
    height: 40px;
    justify-content: center;
    letter-spacing: 0;
    line-height: 1;
    position: relative;
    width: 40px;
  }

  .brand-mark::before {
    background: #54d37e;
    border-radius: 8px 8px 8px 2px;
    content: "";
    height: 12px;
    position: absolute;
    right: 7px;
    top: 6px;
    transform: rotate(-28deg);
    width: 8px;
  }

  .brand-mark span {
    position: relative;
    top: 4px;
  }

  .brand h1 {
    font-size: 17px;
    line-height: 1.2;
    margin: 0;
  }

  .brand p {
    color: var(--muted);
    font-size: 12px;
    margin: 2px 0 0;
  }

  .status-pill {
    align-items: center;
    background: #f7faf7;
    border: 1px solid var(--line);
    border-radius: 999px;
    color: var(--muted);
    display: inline-flex;
    flex-shrink: 0;
    font-size: 13px;
    gap: 8px;
    padding: 8px 12px;
  }

  .status-dot {
    border-radius: 999px;
    height: 8px;
    width: 8px;
  }

  .tabs-wrap {
    border-bottom: 1px solid var(--line);
    background: #fbfcfb;
  }

  .tabs {
    display: flex;
    gap: 6px;
    margin: 0 auto;
    max-width: 1180px;
    overflow-x: auto;
    padding: 10px 24px;
  }

  .tab {
    align-items: center;
    background: transparent;
    border-radius: 8px;
    color: var(--muted);
    cursor: pointer;
    display: inline-flex;
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 650;
    gap: 9px;
    padding: 10px 14px;
  }

  .tab:hover {
    background: var(--surface-soft);
    color: var(--ink);
  }

  .tab.active {
    background: #153824;
    color: #ffffff;
  }

  .tab-icon {
    align-items: center;
    border: 1px solid currentColor;
    border-radius: 6px;
    display: inline-flex;
    font-size: 10px;
    font-weight: 800;
    height: 22px;
    justify-content: center;
    width: 24px;
  }

  .content {
    margin: 0 auto;
    max-width: 1180px;
    padding: 28px 24px 48px;
  }

  .page-intro {
    align-items: flex-start;
    display: flex;
    gap: 20px;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .eyebrow {
    color: var(--green);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  .page-title {
    font-size: 30px;
    letter-spacing: 0;
    line-height: 1.1;
    margin: 0;
  }

  .page-copy {
    color: var(--muted);
    font-size: 15px;
    line-height: 1.6;
    margin: 10px 0 0;
    max-width: 650px;
  }

  .mini-action {
    align-items: center;
    background: #ffffff;
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--ink);
    display: inline-flex;
    font-size: 13px;
    font-weight: 700;
    gap: 8px;
    padding: 10px 12px;
    white-space: nowrap;
  }

  .metric-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 20px;
  }

  .metric-card,
  .chart-panel,
  .control-panel,
  .result-panel,
  .text-panel,
  .nlp-result,
  .model-strip {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 8px;
    box-shadow: var(--shadow);
  }

  .metric-card {
    padding: 18px;
  }

  .metric-label {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  .metric-value {
    color: var(--ink);
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
  }

  .metric-note {
    color: var(--muted);
    font-size: 12px;
    margin-top: 10px;
  }

  .charts-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .chart-panel {
    min-height: 335px;
    padding: 22px;
  }

  .panel-heading {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .panel-heading h2 {
    font-size: 16px;
    margin: 0;
  }

  .panel-heading span {
    color: var(--muted);
    font-size: 12px;
  }

  .model-strip {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 20px;
    padding: 16px;
  }

  .model-item {
    border-left: 3px solid var(--green);
    padding: 4px 0 4px 12px;
  }

  .model-item strong {
    display: block;
    font-size: 18px;
  }

  .model-item span {
    color: var(--muted);
    display: block;
    font-size: 12px;
    margin-top: 3px;
  }

  .prediction-grid {
    align-items: start;
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  }

  .control-panel,
  .result-panel,
  .text-panel,
  .nlp-result {
    padding: 22px;
  }

  .field-grid {
    display: grid;
    gap: 14px;
  }

  .slider-item {
    background: #fbfcfb;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 14px;
  }

  .slider-top {
    align-items: flex-start;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .slider-label {
    color: var(--ink);
    display: block;
    font-size: 14px;
    font-weight: 750;
  }

  .slider-hint {
    color: var(--muted);
    display: block;
    font-size: 12px;
    margin-top: 3px;
  }

  .number-input {
    background: #ffffff;
    border: 1px solid var(--line-strong);
    border-radius: 7px;
    color: var(--ink);
    font-weight: 700;
    max-width: 110px;
    min-width: 88px;
    padding: 8px 10px;
    text-align: right;
  }

  .number-input:focus,
  .nlp-textarea:focus {
    border-color: var(--green);
    box-shadow: 0 0 0 3px rgba(22, 122, 74, 0.14);
    outline: none;
  }

  input[type="range"] {
    accent-color: var(--green);
    width: 100%;
  }

  .range-meta {
    color: var(--muted);
    display: flex;
    font-size: 11px;
    justify-content: space-between;
    margin-top: 4px;
  }

  .realtime-bar {
    align-items: center;
    background: #eef7f1;
    border: 1px solid #cfe7d6;
    border-radius: 8px;
    color: #215d3b;
    display: flex;
    gap: 10px;
    justify-content: space-between;
    margin-top: 14px;
    padding: 12px 14px;
  }

  .realtime-bar.error {
    background: #fff1f0;
    border-color: #ffd0cc;
    color: var(--danger);
  }

  .status-text {
    font-size: 13px;
    font-weight: 700;
  }

  .refresh-button,
  .primary-button,
  .example-button {
    align-items: center;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    font-weight: 750;
    justify-content: center;
  }

  .refresh-button {
    background: #ffffff;
    border: 1px solid #bfd8c8;
    color: var(--green-strong);
    font-size: 13px;
    padding: 8px 10px;
  }

  .primary-button {
    background: #153824;
    color: white;
    font-size: 14px;
    margin-top: 16px;
    padding: 13px 16px;
    width: 100%;
  }

  .primary-button:hover,
  .refresh-button:hover,
  .example-button:hover {
    filter: brightness(0.98);
  }

  .primary-button:disabled,
  .refresh-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .result-panel {
    overflow: hidden;
    position: sticky;
    top: 128px;
  }

  .result-main {
    border-bottom: 1px solid var(--line);
    padding-bottom: 20px;
  }

  .category-mark {
    align-items: center;
    background: #153824;
    border-radius: 8px;
    color: #ffffff;
    display: inline-flex;
    font-size: 15px;
    font-weight: 850;
    height: 48px;
    justify-content: center;
    margin-bottom: 16px;
    width: 52px;
  }

  .result-label {
    color: var(--muted);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  .result-category {
    color: var(--ink);
    font-size: 34px;
    font-weight: 850;
    line-height: 1.1;
    margin: 0 0 8px;
  }

  .result-copy {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }

  .price-block {
    align-items: end;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding: 20px 0;
  }

  .price-value {
    color: var(--amber);
    font-size: 42px;
    font-weight: 900;
    line-height: 1;
  }

  .price-unit {
    color: var(--muted);
    font-size: 13px;
    margin-top: 6px;
  }

  .signal-grid {
    border-top: 1px solid var(--line);
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr;
    padding-top: 18px;
  }

  .signal {
    background: #f8faf8;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 12px;
  }

  .signal span {
    color: var(--muted);
    display: block;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .signal strong {
    display: block;
    font-size: 17px;
    margin-top: 5px;
  }

  .empty-state {
    align-items: center;
    color: var(--muted);
    display: flex;
    min-height: 300px;
    text-align: left;
  }

  .empty-state strong {
    color: var(--ink);
    display: block;
    font-size: 20px;
    margin-bottom: 8px;
  }

  .spinner {
    animation: spin 0.8s linear infinite;
    border: 2px solid rgba(22, 122, 74, 0.18);
    border-radius: 999px;
    border-top-color: var(--green);
    display: inline-block;
    height: 16px;
    width: 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .nlp-layout {
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 0.65fr);
  }

  .nlp-textarea {
    background: #fbfcfb;
    border: 1px solid var(--line-strong);
    border-radius: 8px;
    color: var(--ink);
    min-height: 180px;
    padding: 14px;
    resize: vertical;
    width: 100%;
  }

  .examples {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .example-button {
    background: #f7faf7;
    border: 1px solid var(--line);
    color: var(--ink);
    font-size: 12px;
    padding: 8px 10px;
  }

  .clean-text {
    background: #f8faf8;
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 13px;
    line-height: 1.55;
    margin-top: 14px;
    padding: 12px;
    word-break: break-word;
  }

  .nlp-meta {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    margin-top: 10px;
  }

  .tooltip {
    background: #ffffff;
    border: 1px solid var(--line);
    border-radius: 8px;
    box-shadow: var(--shadow);
    color: var(--ink);
    padding: 10px 12px;
  }

  @media (max-width: 900px) {
    .topbar-inner,
    .page-intro,
    .prediction-grid,
    .nlp-layout {
      display: block;
    }

    .status-pill,
    .mini-action {
      margin-top: 14px;
    }

    .metric-grid,
    .charts-grid,
    .model-strip {
      grid-template-columns: 1fr;
    }

    .result-panel {
      margin-top: 20px;
      position: static;
    }

    .nlp-result {
      margin-top: 20px;
    }
  }

  @media (max-width: 560px) {
    .topbar-inner,
    .tabs,
    .content {
      padding-left: 16px;
      padding-right: 16px;
    }

    .brand h1 {
      font-size: 15px;
    }

    .page-title {
      font-size: 24px;
    }

    .metric-value,
    .result-category {
      font-size: 26px;
    }

    .price-value {
      font-size: 34px;
    }

    .slider-top,
    .price-block {
      align-items: stretch;
      display: block;
    }

    .number-input {
      margin-top: 10px;
      max-width: none;
      width: 100%;
    }

    .signal-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatTnd(value) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatMetric(value, suffix = "") {
  if (value === null || value === undefined) return "-";
  const formatted = Number.isInteger(Number(value))
    ? formatNumber(Number(value))
    : Number(value).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  return `${formatted}${suffix}`;
}

function PageIntro({ eyebrow, title, copy, action }) {
  return (
    <div className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="page-title">{title}</h2>
        <p className="page-copy">{copy}</p>
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, note }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <strong>{label || payload[0].name}</strong>
      <div>{formatMetric(payload[0].value)}</div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/data/stats`).then((response) => setStats(response.data));
  }, []);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.categories).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const barData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Classification", score: stats.accuracy_classification },
      { name: "NLP", score: stats.accuracy_nlp },
      { name: "Multimodal", score: stats.accuracy_multimodal },
      { name: "Regression R2", score: stats.r2_regression * 100 },
    ];
  }, [stats]);

  if (!stats) {
    return (
      <div className="empty-state">
        <div>
          <strong>Chargement du tableau de bord</strong>
          Recuperation des statistiques depuis l'API.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Vue d'ensemble"
        title="Pilotage du classificateur eco-smart"
        copy="Suivez les volumes, la repartition des categories et les performances des modeles avant d'utiliser la prediction."
        action={<div className="mini-action">API active: /data/stats</div>}
      />

      <div className="metric-grid">
        <MetricCard label="Total dechets" value={formatNumber(stats.total_lignes)} note="Lignes dans le dataset" />
        <MetricCard label="Labellises" value={formatNumber(stats.total_labellise)} note="Donnees supervisees" />
        <MetricCard label="Categories" value="4" note="Metal, papier, plastique, verre" />
        <MetricCard label="Accuracy max" value={`${stats.accuracy_classification}%`} note="Modele classification" />
      </div>

      <div className="charts-grid">
        <div className="chart-panel">
          <div className="panel-heading">
            <h2>Distribution des categories</h2>
            <span>{formatNumber(stats.total_labellise)} observations</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                dataKey="value"
                innerRadius={58}
                outerRadius={92}
                isAnimationActive={false}
                paddingAngle={3}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || "#167a4a"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="panel-heading">
            <h2>Performance des modeles</h2>
            <span>Scores principaux</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#647067", fontSize: 11 }} />
              <YAxis domain={[0, 105]} tick={{ fill: "#647067", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                fill="#167a4a"
                radius={[7, 7, 0, 0]}
                barSize={42}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="model-strip">
        <div className="model-item">
          <strong>{stats.accuracy_classification}%</strong>
          <span>Classification numerique</span>
        </div>
        <div className="model-item">
          <strong>{stats.accuracy_nlp}%</strong>
          <span>Analyse NLP</span>
        </div>
        <div className="model-item">
          <strong>{stats.r2_regression}</strong>
          <span>R2 regression prix</span>
        </div>
      </div>
    </div>
  );
}

function SliderControl({ config, value, onChange }) {
  const clampValue = (nextValue) => {
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed)) return config.min;
    return Math.min(config.max, Math.max(config.min, parsed));
  };

  return (
    <div className="slider-item">
      <div className="slider-top">
        <div>
          <label className="slider-label" htmlFor={config.key}>
            {config.label}
          </label>
          <span className="slider-hint">{config.hint}</span>
        </div>
        <input
          className="number-input"
          id={`${config.key}-number`}
          type="number"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(event) => onChange(config.key, clampValue(event.target.value))}
        />
      </div>
      <input
        id={config.key}
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(event) => onChange(config.key, clampValue(event.target.value))}
      />
      <div className="range-meta">
        <span>{config.min}</span>
        <span>
          {formatMetric(value)}
          {config.unit ? ` ${config.unit}` : ""}
        </span>
        <span>{config.max}</span>
      </div>
    </div>
  );
}

function Prediction() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runPrediction = async (payload = values) => {
    setLoading(true);
    setError("");
    try {
      const [classification, regression] = await Promise.all([
        axios.post(`${API}/predict/classification`, payload),
        axios.post(`${API}/predict/regression`, payload),
      ]);
      setResult({
        categorie: classification.data.categorie,
        prix: regression.data.prix_estime,
        devise: regression.data.devise || "TND",
      });
    } catch (err) {
      setError("Prediction indisponible. Verifiez que l'API est demarree.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      runPrediction(values);
    }, 360);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const updateValue = (key, nextValue) => {
    setValues((current) => ({ ...current, [key]: nextValue }));
  };

  return (
    <div>
      <PageIntro
        eyebrow="Prediction temps reel"
        title="Estimer la categorie et le prix sans clic inutile"
        copy="Ajustez les proprietes physiques du lot. Le modele recalcule automatiquement la categorie probable et le prix estime."
        action={<div className="mini-action">Mise a jour auto: 360 ms</div>}
      />

      <div className="prediction-grid">
        <div className="control-panel">
          <div className="panel-heading">
            <h2>Caracteristiques du lot</h2>
            <span>Entrees numeriques</span>
          </div>
          <div className="field-grid">
            {SLIDERS.map((slider) => (
              <SliderControl
                key={slider.key}
                config={slider}
                value={values[slider.key]}
                onChange={updateValue}
              />
            ))}
          </div>

          <div className={`realtime-bar ${error ? "error" : ""}`}>
            <span className="status-text">
              {error || (loading ? "Calcul en cours..." : "Prediction synchronisee")}
            </span>
            {loading ? (
              <span className="spinner" aria-label="Chargement" />
            ) : (
              <button className="refresh-button" onClick={() => runPrediction(values)} type="button">
                Recalculer
              </button>
            )}
          </div>
        </div>

        <div className="result-panel">
          {result ? (
            <>
              <div className="result-main">
                <div className="category-mark">{CATEGORY_MARKS[result.categorie] || "EC"}</div>
                <p className="result-label">Categorie predite</p>
                <h3 className="result-category">{result.categorie}</h3>
                <p className="result-copy">
                  Resultat produit par le modele multimodal a partir des variables physiques.
                </p>
              </div>

              <div className="price-block">
                <div>
                  <p className="result-label">Prix estime</p>
                  <div className="price-value">{formatTnd(result.prix)} {result.devise || "TND"}</div>
                  <div className="price-unit">Estimation instantanee pour ce lot</div>
                </div>
              </div>

              <div className="signal-grid">
                <div className="signal">
                  <span>Poids</span>
                  <strong>{formatMetric(values.poids, " kg")}</strong>
                </div>
                <div className="signal">
                  <span>Volume</span>
                  <strong>{formatMetric(values.volume, " L")}</strong>
                </div>
                <div className="signal">
                  <span>Opacite</span>
                  <strong>{formatMetric(values.opacite)}</strong>
                </div>
                <div className="signal">
                  <span>Rigidite</span>
                  <strong>{formatMetric(values.rigidite)}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div>
                <strong>Prediction en preparation</strong>
                Les premiers resultats apparaissent automatiquement.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssistantNLP() {
  const [texte, setTexte] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictText = async () => {
    if (!texte.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/predict/nlp`, { texte });
      setResult(response.data);
    } catch (err) {
      setResult({ error: "Analyse indisponible pour le moment." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageIntro
        eyebrow="Analyse textuelle"
        title="Classifier une description libre"
        copy="Utilisez une description en langage naturel pour valider la prediction NLP et visualiser le texte nettoye par le pipeline."
        action={<div className="mini-action">Endpoint: /predict/nlp</div>}
      />

      <div className="nlp-layout">
        <div className="text-panel">
          <div className="panel-heading">
            <h2>Description du dechet</h2>
            <span>{texte.length} caracteres</span>
          </div>
          <textarea
            className="nlp-textarea"
            placeholder="Exemple: materiau metallique rigide et lourd, aspect brillant, conducteur electrique..."
            value={texte}
            onChange={(event) => setTexte(event.target.value)}
          />
          <div className="examples">
            {NLP_EXAMPLES.map((example, index) => (
              <button
                className="example-button"
                key={example}
                onClick={() => setTexte(example)}
                type="button"
              >
                Exemple {index + 1}
              </button>
            ))}
          </div>
          <button className="primary-button" disabled={loading || !texte.trim()} onClick={predictText} type="button">
            {loading ? "Analyse en cours..." : "Analyser le texte"}
          </button>
        </div>

        <div className="nlp-result">
          {result?.error ? (
            <div className="empty-state">
              <div>
                <strong>Erreur API</strong>
                {result.error}
              </div>
            </div>
          ) : result ? (
            <>
              <div className="category-mark">{CATEGORY_MARKS[result.categorie] || "NL"}</div>
              <p className="result-label">Categorie NLP</p>
              <h3 className="result-category">{result.categorie}</h3>
              <p className="result-copy">Texte conserve apres nettoyage du pipeline.</p>
              {result.source ? (
                <div className="nlp-meta">Decision: {result.source}</div>
              ) : null}
              <div className="clean-text">{result.texte_nettoye}</div>
            </>
          ) : (
            <div className="empty-state">
              <div>
                <strong>Aucun texte analyse</strong>
                Lancez une analyse pour afficher la categorie et le texte nettoye.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    const index = TAB_HASHES.indexOf(hash);
    return index >= 0 ? index : 0;
  });
  const [apiOk, setApiOk] = useState(false);

  useEffect(() => {
    axios.get(`${API}/health`).then(() => setApiOk(true)).catch(() => setApiOk(false));
  }, []);

  const tabs = [
    { label: "Dashboard", icon: "DB" },
    { label: "Prediction", icon: "PR" },
    { label: "Assistant NLP", icon: "NL" },
  ];

  const selectTab = (index) => {
    setTab(index);
    window.history.replaceState(null, "", `#${TAB_HASHES[index]}`);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <div className="brand-mark" aria-label="Logo Eco-Smart">
                <span>ES</span>
              </div>
              <div>
                <h1>Eco-Smart Classifier</h1>
                <p>FastAPI, React et modeles ML deployables en Docker</p>
              </div>
            </div>
            <div className="status-pill">
              <span
                className="status-dot"
                style={{ background: apiOk ? "#167a4a" : "#b42318" }}
              />
              API {apiOk ? "connectee" : "hors ligne"}
            </div>
          </div>
        </header>

        <div className="tabs-wrap">
          <nav className="tabs" aria-label="Navigation principale">
            {tabs.map((item, index) => (
              <button
                className={`tab ${tab === index ? "active" : ""}`}
                key={item.label}
                onClick={() => selectTab(index)}
                type="button"
              >
                <span className="tab-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <main className="content">
          {tab === 0 && <Dashboard />}
          {tab === 1 && <Prediction />}
          {tab === 2 && <AssistantNLP />}
        </main>
      </div>
    </>
  );
}
