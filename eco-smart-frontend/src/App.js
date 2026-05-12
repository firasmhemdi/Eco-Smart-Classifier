import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API = "http://localhost:8000";

const COLORS = {
  "Métal": "#64748b",
  "Papier": "#f59e0b",
  "Plastique": "#3b82f6",
  "Verre": "#10b981",
};

const ICONS = {
  "Métal": "⚙️",
  "Papier": "📄",
  "Plastique": "🧴",
  "Verre": "🫙",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Space Grotesk', sans-serif;
    background: #0a0f1e;
    color: #e2e8f0;
    min-height: 100vh;
  }

  .app { min-height: 100vh; }

  /* Header */
  .header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-bottom: 1px solid #1e3a5f;
    padding: 20px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981, #3b82f6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .logo-text h1 {
    font-size: 18px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.5px;
  }

  .logo-text p {
    font-size: 12px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }

  .api-status {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #0f2a1a;
    border: 1px solid #10b981;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 13px;
    color: #10b981;
    font-family: 'JetBrains Mono', monospace;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Tabs */
  .tabs {
    display: flex;
    background: #0f172a;
    border-bottom: 1px solid #1e293b;
    padding: 0 40px;
    gap: 4px;
  }

  .tab {
    padding: 16px 24px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
  }

  .tab:hover { color: #94a3b8; }

  .tab.active {
    color: #10b981;
    border-bottom-color: #10b981;
  }

  /* Content */
  .content { padding: 40px; max-width: 1200px; margin: 0 auto; }

  /* Cards */
  .card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 24px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: linear-gradient(135deg, #0f172a, #1e293b);
    border: 1px solid #1e3a5f;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: transform 0.2s;
  }

  .stat-card:hover { transform: translateY(-2px); }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #10b981;
    font-family: 'JetBrains Mono', monospace;
  }

  .stat-label {
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Charts Grid */
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  /* Sliders */
  .slider-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  .slider-item label {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .slider-item label span {
    color: #10b981;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }

  input[type="range"] {
    width: 100%;
    height: 4px;
    border-radius: 4px;
    background: #1e293b;
    outline: none;
    -webkit-appearance: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #10b981;
    border-radius: 50%;
    cursor: pointer;
  }

  /* Predict Button */
  .btn-predict {
    background: linear-gradient(135deg, #10b981, #3b82f6);
    color: white;
    border: none;
    padding: 14px 32px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: opacity 0.2s, transform 0.1s;
    font-family: 'Space Grotesk', sans-serif;
  }

  .btn-predict:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-predict:active { transform: translateY(0); }
  .btn-predict:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Result Box */
  .result-box {
    background: linear-gradient(135deg, #0a2a1a, #0a1628);
    border: 1px solid #10b981;
    border-radius: 12px;
    padding: 24px;
    margin-top: 20px;
    text-align: center;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .result-icon { font-size: 48px; margin-bottom: 12px; }

  .result-category {
    font-size: 28px;
    font-weight: 700;
    color: #10b981;
    margin-bottom: 8px;
  }

  .result-price {
    font-size: 20px;
    color: #f59e0b;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }

  /* NLP Textarea */
  .nlp-textarea {
    width: 100%;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 16px;
    color: #e2e8f0;
    font-size: 14px;
    font-family: 'Space Grotesk', sans-serif;
    resize: vertical;
    min-height: 120px;
    margin-bottom: 16px;
    outline: none;
    transition: border-color 0.2s;
  }

  .nlp-textarea:focus { border-color: #10b981; }

  /* Performance badges */
  .perf-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 16px;
  }

  .perf-badge {
    background: #0f2a1a;
    border: 1px solid #10b981;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .perf-value {
    font-size: 22px;
    font-weight: 700;
    color: #10b981;
    font-family: 'JetBrains Mono', monospace;
  }

  .perf-label {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
    text-transform: uppercase;
  }

  /* Loading */
  .loading {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Category chips */
  .category-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    margin: 4px;
  }
`;

// ── Dashboard Tab ──────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/data/stats`).then(r => setStats(r.data));
  }, []);

  if (!stats) return <div style={{ color: "#64748b", padding: 40 }}>Chargement...</div>;

  const pieData = Object.entries(stats.categories).map(([name, value]) => ({ name, value }));
  const barData = [
    { name: "Classification", accuracy: stats.accuracy_classification },
    { name: "NLP", accuracy: stats.accuracy_nlp },
    { name: "Multimodal", accuracy: stats.accuracy_multimodal },
    { name: "Régression R²", accuracy: stats.r2_regression * 100 },
  ];

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_lignes.toLocaleString()}</div>
          <div className="stat-label">Total Déchets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_labellise.toLocaleString()}</div>
          <div className="stat-label">Labellisés</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">4</div>
          <div className="stat-label">Catégories</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.accuracy_classification}%</div>
          <div className="stat-label">Accuracy Max</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-title">📊 Distribution des Catégories</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || "#6366f1"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => v.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">🎯 Performance des Modèles</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis domain={[0, 105]} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
              <Bar dataKey="accuracy" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🏆 Résumé des Performances</div>
        <div className="perf-grid">
          <div className="perf-badge">
            <div className="perf-value">{stats.accuracy_classification}%</div>
            <div className="perf-label">Classification</div>
          </div>
          <div className="perf-badge">
            <div className="perf-value">{stats.accuracy_nlp}%</div>
            <div className="perf-label">NLP</div>
          </div>
          <div className="perf-badge">
            <div className="perf-value">{stats.r2_regression}</div>
            <div className="perf-label">R² Régression</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Prediction Tab ─────────────────────────────────────────
function Prediction() {
  const [values, setValues] = useState({ poids: 50, volume: 100, conductivite: 0.1, opacite: 1.0, rigidite: 5 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sliders = [
    { key: "poids", label: "Poids (kg)", min: 0, max: 300, step: 1 },
    { key: "volume", label: "Volume (L)", min: 0, max: 530, step: 1 },
    { key: "conductivite", label: "Conductivité", min: -0.31, max: 0.52, step: 0.01 },
    { key: "opacite", label: "Opacité", min: -0.91, max: 2.15, step: 0.01 },
    { key: "rigidite", label: "Rigidité", min: 1.5, max: 11, step: 0.1 },
  ];

  const predire = async () => {
    setLoading(true);
    try {
      const [clf, reg] = await Promise.all([
        axios.post(`${API}/predict/classification`, values),
        axios.post(`${API}/predict/regression`, values),
      ]);
      setResult({ categorie: clf.data.categorie, prix: reg.data.prix_estime });
    } catch (e) {
      alert("Erreur API !");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🎛️ Ajuster les caractéristiques</div>
        <div className="slider-grid">
          {sliders.map(s => (
            <div className="slider-item" key={s.key}>
              <label>
                {s.label}
                <span>{values[s.key]}</span>
              </label>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={values[s.key]}
                onChange={e => setValues({ ...values, [s.key]: parseFloat(e.target.value) })}
              />
            </div>
          ))}
        </div>
        <button className="btn-predict" onClick={predire} disabled={loading}>
          {loading ? <><span className="loading"></span>Prédiction...</> : "🔍 Prédire la Catégorie & le Prix"}
        </button>
      </div>

      {result && (
        <div className="result-box">
          <div className="result-icon">{ICONS[result.categorie] || "♻️"}</div>
          <div className="result-category">{result.categorie}</div>
          <div className="result-price">Prix estimé : {result.prix} €</div>
        </div>
      )}
    </div>
  );
}

// ── NLP Tab ────────────────────────────────────────────────
function AssistantNLP() {
  const [texte, setTexte] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const exemples = [
    "Matériau métallique très rigide et lourd, conducteur électrique, aspect brillant.",
    "Feuilles de papier et cartons souples, très légers, aspect opaque, non conducteur.",
    "Conteneur plastique semi-rigide, léger, faible conductivité, usage alimentaire.",
    "Bris de verre transparents, rigides, conductivité modérée, provenance ménagère.",
  ];

  const predire = async () => {
    if (!texte.trim()) return;
    setLoading(true);
    try {
      const r = await axios.post(`${API}/predict/nlp`, { texte });
      setResult(r.data);
    } catch (e) {
      alert("Erreur API !");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">💬 Assistant NLP — Description textuelle</div>
        <textarea
          className="nlp-textarea"
          placeholder="Décrivez le déchet en français... (ex: matériau métallique rigide et lourd)"
          value={texte}
          onChange={e => setTexte(e.target.value)}
        />
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Exemples rapides :</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {exemples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setTexte(ex)}
                style={{
                  background: "#1e293b", border: "1px solid #334155",
                  color: "#94a3b8", padding: "6px 12px", borderRadius: 6,
                  cursor: "pointer", fontSize: 12, fontFamily: "Space Grotesk"
                }}
              >
                Exemple {i + 1}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-predict" onClick={predire} disabled={loading || !texte.trim()}>
          {loading ? <><span className="loading"></span>Analyse...</> : "🔍 Analyser le texte"}
        </button>
      </div>

      {result && (
        <div className="result-box">
          <div className="result-icon">{ICONS[result.categorie] || "♻️"}</div>
          <div className="result-category">{result.categorie}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 12 }}>
            Texte nettoyé : <span style={{ color: "#94a3b8", fontFamily: "JetBrains Mono" }}>{result.texte_nettoye}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const [apiOk, setApiOk] = useState(false);

  useEffect(() => {
    axios.get(`${API}/`).then(() => setApiOk(true)).catch(() => setApiOk(false));
  }, []);

  const tabs = [
    { label: "Dashboard", icon: "📊" },
    { label: "Prédiction", icon: "🎛️" },
    { label: "Assistant NLP", icon: "💬" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">♻️</div>
            <div className="logo-text">
              <h1>Eco-Smart Classifier</h1>
              <p>ML Pipeline · FastAPI · React</p>
            </div>
          </div>
          <div className="api-status">
            <div className="status-dot" style={{ background: apiOk ? "#10b981" : "#ef4444" }}></div>
            API {apiOk ? "Connected" : "Offline"}
          </div>
        </header>

        <div className="tabs">
          {tabs.map((t, i) => (
            <button key={i} className={`tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="content">
          {tab === 0 && <Dashboard />}
          {tab === 1 && <Prediction />}
          {tab === 2 && <AssistantNLP />}
        </div>
      </div>
    </>
  );
}