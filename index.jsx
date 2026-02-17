import { useState, useMemo, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const CATS = {
  length: { label: "Lunghezza", icon: "↔", units: { mm: { factor: 0.001, label: "mm" }, cm: { factor: 0.01, label: "cm" }, m: { factor: 1, label: "m" }, km: { factor: 1000, label: "km" }, in: { factor: 0.0254, label: "in" }, ft: { factor: 0.3048, label: "ft" }, yd: { factor: 0.9144, label: "yd" }, mi: { factor: 1609.344, label: "mi" }, "μm": { factor: 1e-6, label: "μm" }, nm: { factor: 1e-9, label: "nm" }, mil: { factor: 0.0000254, label: "mil" } } },
  area: { label: "Area", icon: "⬜", units: { "mm²": { factor: 1e-6, label: "mm²" }, "cm²": { factor: 1e-4, label: "cm²" }, "m²": { factor: 1, label: "m²" }, "in²": { factor: 6.4516e-4, label: "in²" }, "ft²": { factor: 0.092903, label: "ft²" }, ha: { factor: 1e4, label: "ha" } } },
  volume: { label: "Volume", icon: "▣", units: { "mm³": { factor: 1e-9, label: "mm³" }, "cm³": { factor: 1e-6, label: "cm³" }, "m³": { factor: 1, label: "m³" }, L: { factor: 0.001, label: "L" }, mL: { factor: 1e-6, label: "mL" }, "in³": { factor: 1.6387e-5, label: "in³" }, "ft³": { factor: 0.028317, label: "ft³" } } },
  mass: { label: "Massa", icon: "⚖", units: { mg: { factor: 1e-6, label: "mg" }, g: { factor: 0.001, label: "g" }, kg: { factor: 1, label: "kg" }, t: { factor: 1000, label: "t" }, oz: { factor: 0.028349, label: "oz" }, lb: { factor: 0.453592, label: "lb" } } },
  force: { label: "Forza", icon: "⟶", units: { N: { factor: 1, label: "N" }, kN: { factor: 1000, label: "kN" }, MN: { factor: 1e6, label: "MN" }, daN: { factor: 10, label: "daN" }, kgf: { factor: 9.80665, label: "kgf" }, lbf: { factor: 4.44822, label: "lbf" }, kip: { factor: 4448.22, label: "kip" } } },
  pressure: { label: "Pressione", icon: "◈", units: { Pa: { factor: 1, label: "Pa" }, kPa: { factor: 1000, label: "kPa" }, MPa: { factor: 1e6, label: "MPa" }, GPa: { factor: 1e9, label: "GPa" }, bar: { factor: 1e5, label: "bar" }, atm: { factor: 101325, label: "atm" }, psi: { factor: 6894.76, label: "psi" }, ksi: { factor: 6.89476e6, label: "ksi" }, "N/mm²": { factor: 1e6, label: "N/mm²" } } },
  density: { label: "Densità", icon: "◆", units: { "kg/m³": { factor: 1, label: "kg/m³" }, "g/cm³": { factor: 1000, label: "g/cm³" }, "g/L": { factor: 1, label: "g/L" }, "lb/ft³": { factor: 16.0185, label: "lb/ft³" }, "lb/in³": { factor: 27679.9, label: "lb/in³" } } },
  temperature: { label: "Temp.", icon: "◯", custom: true, units: { "°C": { label: "°C" }, "°F": { label: "°F" }, K: { label: "K" } } },
  energy: { label: "Energia", icon: "⚡", units: { J: { factor: 1, label: "J" }, kJ: { factor: 1000, label: "kJ" }, cal: { factor: 4.184, label: "cal" }, kcal: { factor: 4184, label: "kcal" }, kWh: { factor: 3.6e6, label: "kWh" }, BTU: { factor: 1055.06, label: "BTU" }, "ft·lbf": { factor: 1.35582, label: "ft·lbf" } } },
  power: { label: "Potenza", icon: "⏻", units: { W: { factor: 1, label: "W" }, kW: { factor: 1000, label: "kW" }, MW: { factor: 1e6, label: "MW" }, hp: { factor: 745.7, label: "hp" }, CV: { factor: 735.499, label: "CV" } } },
  velocity: { label: "Velocità", icon: "»", units: { "m/s": { factor: 1, label: "m/s" }, "km/h": { factor: 0.27778, label: "km/h" }, "ft/s": { factor: 0.3048, label: "ft/s" }, mph: { factor: 0.44704, label: "mph" }, kn: { factor: 0.51444, label: "kn" } } },
  torque: { label: "Coppia", icon: "↻", units: { "N·m": { factor: 1, label: "N·m" }, "kN·m": { factor: 1000, label: "kN·m" }, "N·mm": { factor: 0.001, label: "N·mm" }, "kgf·m": { factor: 9.80665, label: "kgf·m" }, "lbf·ft": { factor: 1.35582, label: "lbf·ft" }, "lbf·in": { factor: 0.112985, label: "lbf·in" } } },
  angle: { label: "Angolo", icon: "∠", units: { rad: { factor: 1, label: "rad" }, deg: { factor: Math.PI / 180, label: "°" }, mrad: { factor: 0.001, label: "mrad" }, rev: { factor: 2 * Math.PI, label: "rev" } } },
};

function convTemp(v, from, to) { if (from === to) return v; let k; if (from === "°C") k = v + 273.15; else if (from === "°F") k = (v - 32) * 5 / 9 + 273.15; else k = v; if (to === "°C") return k - 273.15; if (to === "°F") return (k - 273.15) * 9 / 5 + 32; return k; }

const DIM_QTY = { "Forza": { f: "M × a", d: "M·L·T⁻²", e: "F=m·a" }, "Pressione": { f: "F / A", d: "M·L⁻¹·T⁻²", e: "σ=F/A" }, "Energia": { f: "F × L", d: "M·L²·T⁻²", e: "W=F·d" }, "Potenza": { f: "E / t", d: "M·L²·T⁻³", e: "P=W/t" }, "Densità": { f: "M / V", d: "M·L⁻³", e: "ρ=m/V" }, "Velocità": { f: "L / t", d: "L·T⁻¹", e: "v=d/t" }, "Accelerazione": { f: "L / t²", d: "L·T⁻²", e: "a=v/t" }, "Coppia": { f: "F × L", d: "M·L²·T⁻²", e: "τ=F×r" }, "Visc. dinamica": { f: "P × t", d: "M·L⁻¹·T⁻¹", e: "μ" }, "Visc. cinematica": { f: "A / t", d: "L²·T⁻¹", e: "ν=μ/ρ" }, "I area": { f: "L⁴", d: "L⁴", e: "I=bh³/12" }, "Cond. termica": { f: "P/(L·Θ)", d: "M·L·T⁻³·Θ⁻¹", e: "k" }, "Calore spec.": { f: "E/(M·Θ)", d: "L²·T⁻²·Θ⁻¹", e: "c" }, "Tens. superf.": { f: "F / L", d: "M·T⁻²", e: "γ=F/L" }, "Deformazione": { f: "—", d: "adim.", e: "ε=ΔL/L" } };

const MATS = { "CFRP UD": { density: 1550, E: 130, sigma: 1500, label: "Carbonio UD 0°" }, "CFRP Fabric": { density: 1500, E: 60, sigma: 600, label: "Carbonio Tessuto" }, "GFRP UD": { density: 1900, E: 40, sigma: 1000, label: "Vetro UD" }, "Al 7075-T6": { density: 2810, E: 71.7, sigma: 503, label: "Alluminio 7075" }, "Acciaio S235": { density: 7850, E: 200, sigma: 235, label: "Acciaio S235" }, "Ti-6Al-4V": { density: 4430, E: 113.8, sigma: 880, label: "Titanio" }, "Kevlar 49": { density: 1440, E: 60, sigma: 3600, label: "Aramide" } };

function fmt(n, d = 6) { if (n === 0) return "0"; const a = Math.abs(n); if (a < 1e-12 || a > 1e12) return n.toExponential(3); if (a < 0.001) return n.toExponential(3); return parseFloat(n.toFixed(d)).toString(); }

// ─── APPLE LIGHT THEME ───────────────────────────────────────────────────────
const T = {
  bg: "#F2F2F7",
  card: "#FFFFFF",
  cardSec: "#F9F9FB",
  sep: "rgba(60,60,67,0.12)",
  sepOpaque: "#D1D1D6",
  label: "#000000",
  labelSec: "#3C3C43",
  labelTer: "#8E8E93",
  fill: "rgba(120,120,128,0.08)",
  fillSec: "rgba(120,120,128,0.12)",
  blue: "#007AFF",
  blueBg: "rgba(0,122,255,0.08)",
  green: "#34C759",
  greenBg: "rgba(52,199,89,0.08)",
  orange: "#FF9500",
  red: "#FF3B30",
  teal: "#5AC8FA",
  indigo: "#5856D6",
  tabBar: "rgba(249,249,249,0.94)",
};

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("conv");
  const tabs = [
    { id: "conv", label: "Converti", icon: "⇄" },
    { id: "dim", label: "Analisi", icon: "∑" },
    { id: "calc", label: "Calcola", icon: "⊞" },
    { id: "mat", label: "Materiali", icon: "◈" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: T.bg, color: T.label, fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 15, display: "flex", flexDirection: "column", WebkitTapHighlightColor: "transparent" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{-webkit-text-size-adjust:100%}
        input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none}
        input[type="number"]{-moz-appearance:textfield}
        select{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px!important}
        ::-webkit-scrollbar{width:0;height:0}
        ::selection{background:${T.blue};color:#fff}
        .cs::-webkit-scrollbar{display:none}
        body{overflow-x:hidden;background:${T.bg}}
      `}</style>

      {/* Header */}
      <header style={{ padding: "max(env(safe-area-inset-top),8px) 16px 8px", background: T.tabBar, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `0.5px solid ${T.sep}` }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>Engineering Toolkit</div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 16px", paddingBottom: "calc(68px + env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch" }}>
        {tab === "conv" && <ConvTab />}
        {tab === "dim" && <DimTab />}
        {tab === "calc" && <CalcTab />}
        {tab === "mat" && <MatTab />}
      </main>

      {/* Tab Bar */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: T.tabBar, borderTop: `0.5px solid ${T.sep}`, display: "flex", paddingBottom: "env(safe-area-inset-bottom)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px 4px 4px", gap: 1, background: "none", border: "none", cursor: "pointer", color: tab === t.id ? T.blue : T.labelTer, minHeight: 50 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
function Section({ title, children, style }) {
  return (
    <div style={{ background: T.card, borderRadius: 12, overflow: "hidden", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04)", ...style }}>
      {title && <div style={{ padding: "10px 16px 6px", fontSize: 13, fontWeight: 600, color: T.labelTer, textTransform: "uppercase", letterSpacing: "0.02em" }}>{title}</div>}
      {children}
    </div>
  );
}

function Row({ children, style, sep = true }) {
  return <div style={{ padding: "0 16px", ...style }}><div style={{ padding: "12px 0", borderBottom: sep ? `0.5px solid ${T.sep}` : "none", display: "flex", flexDirection: "column", gap: 8 }}>{children}</div></div>;
}

function Field({ label, value, onChange, unit, placeholder, readOnly, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, ...style }}>
      {label && <span style={{ fontSize: 15, color: T.label, minWidth: 0, flex: "0 0 auto", maxWidth: "40%" }}>{label}</span>}
      <div style={{ flex: 1, display: "flex", alignItems: "center", background: T.fill, borderRadius: 10, overflow: "hidden" }}>
        <input type="number" inputMode="decimal" value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder || "0"} readOnly={readOnly} style={{ flex: 1, width: "100%", minWidth: 0, background: "transparent", border: "none", outline: "none", color: readOnly ? T.labelTer : T.label, padding: "11px 12px", fontSize: 17, fontWeight: 400, fontFamily: "-apple-system, 'SF Pro Text', sans-serif", textAlign: "right" }} />
        {unit && <span style={{ padding: "0 10px 0 0", color: T.blue, fontSize: 15, fontWeight: 500, flexShrink: 0 }}>{unit}</span>}
      </div>
    </div>
  );
}

function FieldStack({ label, value, onChange, unit, placeholder, readOnly }) {
  return (
    <div>
      {label && <div style={{ fontSize: 13, color: T.labelTer, marginBottom: 4, fontWeight: 500 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", background: T.fill, borderRadius: 10, overflow: "hidden" }}>
        <input type="number" inputMode="decimal" value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder || "0"} readOnly={readOnly} style={{ flex: 1, width: "100%", minWidth: 0, background: "transparent", border: "none", outline: "none", color: readOnly ? T.labelTer : T.label, padding: "11px 12px", fontSize: 17, fontFamily: "-apple-system, sans-serif" }} />
        {unit && <span style={{ padding: "0 10px 0 0", color: T.blue, fontSize: 15, fontWeight: 500, flexShrink: 0 }}>{unit}</span>}
      </div>
    </div>
  );
}

function Sel({ label, value, onChange, options, style }) {
  return (
    <div style={style}>
      {label && <div style={{ fontSize: 13, color: T.labelTer, marginBottom: 4, fontWeight: 500 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "11px 12px", background: T.fill, border: "none", borderRadius: 10, color: T.label, fontSize: 15, fontFamily: "-apple-system, sans-serif", outline: "none", minHeight: 44 }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "7px 14px", borderRadius: 20, border: "none", background: active ? T.blue : T.fill, color: active ? "#fff" : T.label, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "-apple-system, sans-serif", whiteSpace: "nowrap", minHeight: 34, flexShrink: 0, transition: "all .15s" }}>
      {children}
    </button>
  );
}

function Chips({ children }) {
  return <div className="cs" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, marginBottom: 12, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>{children}</div>;
}

function Res({ value, unit, formula, extra }) {
  return (
    <div style={{ margin: "12px 16px", padding: 14, borderRadius: 12, background: T.blueBg }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: T.blue, wordBreak: "break-all", letterSpacing: "-0.02em" }}>{value}</span>
        <span style={{ fontSize: 17, color: T.blue, fontWeight: 600 }}>{unit}</span>
      </div>
      {formula && <div style={{ marginTop: 4, fontSize: 13, color: T.labelTer }}>{formula}</div>}
      {extra?.length > 0 && <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>{extra.map((e, i) => <span key={i} style={{ fontSize: 13 }}><span style={{ color: T.labelTer }}>{e.label}: </span><span style={{ fontWeight: 600 }}>{e.value}</span></span>)}</div>}
    </div>
  );
}

function Stats({ items }) {
  return (
    <div style={{ margin: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {items.map((r, i) => (
        <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: T.fill }}>
          <div style={{ fontSize: 11, color: T.labelTer, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{r.label}</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: T.blue }}>{r.value}</span>
          <span style={{ fontSize: 13, color: T.labelTer, marginLeft: 3 }}>{r.unit}</span>
        </div>
      ))}
    </div>
  );
}

function Badge({ children, color = T.blue }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, background: color === T.blue ? T.blueBg : color + "15", color, fontSize: 12, fontWeight: 600 }}>{children}</span>;
}

function SegControl({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: T.fillSec, borderRadius: 9, padding: 2 }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          flex: 1, padding: "7px 6px", borderRadius: 7, border: "none",
          background: value === o.id ? T.card : "transparent",
          color: value === o.id ? T.label : T.labelTer,
          boxShadow: value === o.id ? "0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)" : "none",
          cursor: "pointer", fontSize: 13, fontWeight: 600,
          fontFamily: "-apple-system, sans-serif",
          whiteSpace: "nowrap", transition: "all .15s",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ─── CONVERTER TAB ───────────────────────────────────────────────────────────
function ConvTab() {
  const [cat, setCat] = useState("length");
  const [from, setFrom] = useState("mm");
  const [to, setTo] = useState("in");
  const [val, setVal] = useState("1");
  const c = CATS[cat];
  const opts = Object.entries(c.units).map(([k, v]) => ({ value: k, label: v.label }));

  useEffect(() => { const k = Object.keys(CATS[cat].units); setFrom(k[0]); setTo(k[Math.min(1, k.length - 1)]); }, [cat]);

  const result = useMemo(() => { const v2 = parseFloat(val); if (isNaN(v2)) return ""; if (c.custom) return fmt(convTemp(v2, from, to)); const fF = c.units[from]?.factor, fT = c.units[to]?.factor; if (!fF || !fT) return ""; return fmt(v2 * fF / fT); }, [val, from, to, c]);

  const all = useMemo(() => { const v2 = parseFloat(val); if (isNaN(v2)) return []; return Object.entries(c.units).filter(([k]) => k !== from).map(([k, u]) => ({ unit: k, label: u.label, value: fmt(c.custom ? convTemp(v2, from, k) : v2 * (c.units[from]?.factor || 1) / (u.factor || 1)) })); }, [val, from, c]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Chips>
        {Object.entries(CATS).map(([k, cc]) => (
          <Chip key={k} active={cat === k} onClick={() => setCat(k)}>{cc.icon} {cc.label}</Chip>
        ))}
      </Chips>

      <Section>
        <Row>
          <FieldStack label="Valore" value={val} onChange={setVal} />
        </Row>
        <Row>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Sel label="Da" value={from} onChange={setFrom} options={opts} />
            <Sel label="A" value={to} onChange={setTo} options={opts} />
          </div>
        </Row>
        <Row sep={false}>
          <FieldStack label="Risultato" value={result} readOnly />
        </Row>
        <div style={{ padding: "8px 16px 14px" }}>
          <button onClick={() => { const t = from; setFrom(to); setTo(t); }} style={{ width: "100%", padding: "12px", borderRadius: 10, minHeight: 44, background: T.blueBg, border: "none", color: T.blue, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "-apple-system, sans-serif" }}>⇄ Inverti</button>
        </div>
      </Section>

      <Section title="Tutte le conversioni">
        {all.map((r, i) => (
          <div key={r.unit} style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < all.length - 1 ? `0.5px solid ${T.sep}` : "none" }}>
            <span style={{ color: T.labelTer, fontSize: 15 }}>{r.label}</span>
            <span style={{ fontWeight: 600, fontSize: 17, color: r.unit === to ? T.blue : T.label }}>{r.value}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ─── DIMENSIONAL ANALYSIS TAB ────────────────────────────────────────────────
function DimTab() {
  const [search, setSearch] = useState("");
  const [inp, setInp] = useState([{ value: "10", unit: "kN", dim: "force" }, { value: "200", unit: "mm²", dim: "area" }]);
  const [op, setOp] = useState("divide");
  const dimOpts = [{ value: "force", label: "Forza" }, { value: "area", label: "Area" }, { value: "volume", label: "Volume" }, { value: "length", label: "Lunghezza" }, { value: "mass", label: "Massa" }, { value: "pressure", label: "Pressione" }, { value: "energy", label: "Energia" }, { value: "power", label: "Potenza" }, { value: "velocity", label: "Velocità" }, { value: "density", label: "Densità" }];
  const getU = dim => { const c = CATS[dim]; if (!c) return [{ value: "—", label: "—" }]; return Object.entries(c.units).map(([k, v]) => ({ value: k, label: v.label })); };
  const upd = (i, p) => { const n = [...inp]; n[i] = { ...n[i], ...p }; setInp(n); };

  const res = useMemo(() => {
    const a = parseFloat(inp[0].value), b = parseFloat(inp[1].value);
    if (isNaN(a) || isNaN(b)) return null;
    let fA = 1, fB = 1;
    for (const cat of Object.values(CATS)) { if (cat.units[inp[0].unit]?.factor != null) fA = cat.units[inp[0].unit].factor; if (cat.units[inp[1].unit]?.factor != null) fB = cat.units[inp[1].unit].factor; }
    const siA = a * fA, siB = b * fB;
    if (op === "divide" && siB === 0) return { error: "Divisione per zero" };
    const r = op === "multiply" ? siA * siB : siA / siB;
    const map = { "force/area": { n: "Pressione/Stress", s: "Pa", d: "M·L⁻¹·T⁻²" }, "force*length": { n: "Energia/Momento", s: "J / N·m", d: "M·L²·T⁻²" }, "length*force": { n: "Energia/Momento", s: "J / N·m", d: "M·L²·T⁻²" }, "mass/volume": { n: "Densità", s: "kg/m³", d: "M·L⁻³" }, "force/length": { n: "Rig. lineare", s: "N/m", d: "M·T⁻²" }, "energy/mass": { n: "En. specifica", s: "J/kg", d: "L²·T⁻²" }, "power/area": { n: "Flusso termico", s: "W/m²", d: "M·T⁻³" }, "area/force": { n: "Cedevolezza", s: "Pa⁻¹", d: "M⁻¹·L·T²" }, "volume/mass": { n: "Vol. specifico", s: "m³/kg", d: "M⁻¹·L³" } };
    const key = `${inp[0].dim}${op === "divide" ? "/" : "*"}${inp[1].dim}`;
    const f = map[key];
    return { value: fmt(r), si: f?.s || "SI", name: f?.n || "—", dims: f?.d || "—" };
  }, [inp, op]);

  const filtered = Object.entries(DIM_QTY).filter(([n]) => n.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Calcolatore Dimensionale">
        <div style={{ padding: "4px 16px 8px", color: T.labelTer, fontSize: 13 }}>Combina due grandezze — identifica la dimensione risultante.</div>
        {inp.map((item, i) => (
          <Row key={i} sep={i === 0}>
            <div style={{ fontSize: 13, color: T.blue, fontWeight: 600, marginBottom: 2 }}>Grandezza {i + 1}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Sel label="Tipo" value={item.dim} onChange={v => { const u = Object.keys(CATS[v]?.units || {}); upd(i, { dim: v, unit: u[0] || "—" }); }} options={dimOpts} />
              <Sel label="Unità" value={item.unit} onChange={v => upd(i, { unit: v })} options={getU(item.dim)} />
            </div>
            <FieldStack label="Valore" value={item.value} onChange={v => upd(i, { value: v })} />
            {i === 0 && <button onClick={() => setOp(o => o === "multiply" ? "divide" : "multiply")} style={{ width: "100%", padding: "10px", borderRadius: 10, minHeight: 44, border: "none", background: T.blueBg, color: T.blue, fontWeight: 700, fontSize: 22, cursor: "pointer" }}>{op === "multiply" ? "×" : "÷"}</button>}
          </Row>
        ))}
        {res && !res.error && (
          <div style={{ margin: "8px 16px 14px", padding: 14, borderRadius: 12, background: T.blueBg }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: T.blue, wordBreak: "break-all" }}>{res.value}</span>
              <span style={{ fontSize: 15, color: T.blue, fontWeight: 600 }}>{res.si}</span>
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {res.name !== "—" && <Badge>{res.name}</Badge>}
              <Badge color={T.indigo}>{res.dims}</Badge>
            </div>
          </div>
        )}
        {res?.error && <div style={{ margin: "8px 16px 14px", padding: 12, background: "rgba(255,59,48,0.08)", borderRadius: 10, color: T.red, fontSize: 13 }}>{res.error}</div>}
      </Section>

      <Section title="Riferimento Grandezze">
        <div style={{ padding: "4px 16px 8px" }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca..." style={{ width: "100%", padding: "11px 12px", background: T.fill, border: "none", borderRadius: 10, color: T.label, fontSize: 15, fontFamily: "-apple-system, sans-serif", outline: "none", minHeight: 44 }} />
        </div>
        {filtered.map(([n, q], i) => (
          <div key={n} style={{ padding: "10px 16px", borderBottom: i < filtered.length - 1 ? `0.5px solid ${T.sep}` : "none" }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{n}</div>
            <div style={{ fontSize: 13, color: T.labelTer, marginBottom: 4 }}>{q.f}</div>
            <div style={{ display: "flex", gap: 6 }}><Badge color={T.indigo}>{q.d}</Badge><Badge color={T.labelTer}>{q.e}</Badge></div>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ─── CALCULATORS TAB ─────────────────────────────────────────────────────────
function CalcTab() {
  const [sub, setSub] = useState("area");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Chips>{[{ id: "area", l: "⬜ Aree" }, { id: "vol", l: "▣ Volumi" }, { id: "rho", l: "⚖ Densità" }, { id: "lam", l: "≡ Laminato" }, { id: "sig", l: "◈ Stress" }, { id: "ine", l: "⊕ Inerzia" }].map(c => <Chip key={c.id} active={sub === c.id} onClick={() => setSub(c.id)}>{c.l}</Chip>)}</Chips>
      {sub === "area" && <AreaC />}{sub === "vol" && <VolC />}{sub === "rho" && <RhoC />}{sub === "lam" && <LamC />}{sub === "sig" && <SigC />}{sub === "ine" && <IneC />}
    </div>
  );
}

function AreaC() {
  const [sh, setSh] = useState("rect");
  const [v, sv] = useState({ a: "100", b: "50", r: "25", h: "80" });
  const s = (k, x) => sv(p => ({ ...p, [k]: x }));
  const res = useMemo(() => { const a = parseFloat(v.a), b = parseFloat(v.b), r = parseFloat(v.r), h = parseFloat(v.h); if (sh === "rect") return isNaN(a * b) ? null : { v: a * b, f: `${a} × ${b}` }; if (sh === "circle") return isNaN(r) ? null : { v: Math.PI * r * r, f: `π · ${r}²` }; if (sh === "tri") return isNaN(a * h) ? null : { v: .5 * a * h, f: `½ · ${a} · ${h}` }; if (sh === "ellipse") return isNaN(a * b) ? null : { v: Math.PI * a * b, f: `π · ${a} · ${b}` }; if (sh === "ring") return isNaN(a * b) ? null : { v: Math.PI * (a * a - b * b), f: `π · (${a}² − ${b}²)` }; return null; }, [sh, v]);
  return (<>
    <Section title="Aree">
      <div style={{ padding: "4px 16px 8px" }}><Chips>{[{ id: "rect", l: "Rett." }, { id: "circle", l: "Cerchio" }, { id: "tri", l: "Triang." }, { id: "ellipse", l: "Ellisse" }, { id: "ring", l: "Corona" }].map(x => <Chip key={x.id} active={sh === x.id} onClick={() => setSh(x.id)}>{x.l}</Chip>)}</Chips></div>
      <Row sep={false}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(sh === "rect" || sh === "ellipse" || sh === "ring") && <><FieldStack label={sh === "ring" ? "R est. (mm)" : sh === "ellipse" ? "Semiasse a (mm)" : "Lato a (mm)"} value={v.a} onChange={x => s("a", x)} /><FieldStack label={sh === "ring" ? "R int. (mm)" : sh === "ellipse" ? "Semiasse b (mm)" : "Lato b (mm)"} value={v.b} onChange={x => s("b", x)} /></>}
          {sh === "circle" && <FieldStack label="Raggio (mm)" value={v.r} onChange={x => s("r", x)} />}
          {sh === "tri" && <><FieldStack label="Base (mm)" value={v.a} onChange={x => s("a", x)} /><FieldStack label="Altezza (mm)" value={v.h} onChange={x => s("h", x)} /></>}
        </div>
      </Row>
      {res && <Res value={fmt(res.v)} unit="mm²" formula={res.f} extra={[{ label: "cm²", value: fmt(res.v / 100) }, { label: "m²", value: fmt(res.v / 1e6) }, { label: "in²", value: fmt(res.v / 645.16) }]} />}
    </Section>
  </>);
}

function VolC() {
  const [sh, setSh] = useState("box");
  const [v, sv] = useState({ l: "100", w: "50", h: "30", r: "25", ri: "20" });
  const s = (k, x) => sv(p => ({ ...p, [k]: x }));
  const res = useMemo(() => { const l = parseFloat(v.l), w = parseFloat(v.w), h = parseFloat(v.h), r = parseFloat(v.r), ri = parseFloat(v.ri); if (sh === "box") return isNaN(l * w * h) ? null : { v: l * w * h, f: `${l} × ${w} × ${h}` }; if (sh === "cyl") return isNaN(r * h) ? null : { v: Math.PI * r * r * h, f: `π · ${r}² · ${h}` }; if (sh === "sph") return isNaN(r) ? null : { v: 4 / 3 * Math.PI * r ** 3, f: `4/3 · π · ${r}³` }; if (sh === "tube") return isNaN(r * ri * h) ? null : { v: Math.PI * (r * r - ri * ri) * h, f: `π · (R² − r²) · h` }; return null; }, [sh, v]);
  return (
    <Section title="Volumi">
      <div style={{ padding: "4px 16px 8px" }}><Chips>{[{ id: "box", l: "Box" }, { id: "cyl", l: "Cilindro" }, { id: "sph", l: "Sfera" }, { id: "tube", l: "Tubo" }].map(x => <Chip key={x.id} active={sh === x.id} onClick={() => setSh(x.id)}>{x.l}</Chip>)}</Chips></div>
      <Row sep={false}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sh === "box" && <><FieldStack label="L (mm)" value={v.l} onChange={x => s("l", x)} /><FieldStack label="W (mm)" value={v.w} onChange={x => s("w", x)} /><FieldStack label="H (mm)" value={v.h} onChange={x => s("h", x)} /></>}
          {sh === "cyl" && <><FieldStack label="R (mm)" value={v.r} onChange={x => s("r", x)} /><FieldStack label="H (mm)" value={v.h} onChange={x => s("h", x)} /></>}
          {sh === "sph" && <FieldStack label="R (mm)" value={v.r} onChange={x => s("r", x)} />}
          {sh === "tube" && <><FieldStack label="R est. (mm)" value={v.r} onChange={x => s("r", x)} /><FieldStack label="R int. (mm)" value={v.ri} onChange={x => s("ri", x)} /><FieldStack label="H (mm)" value={v.h} onChange={x => s("h", x)} /></>}
        </div>
      </Row>
      {res && <Res value={fmt(res.v)} unit="mm³" formula={res.f} extra={[{ label: "cm³", value: fmt(res.v / 1e3) }, { label: "L", value: fmt(res.v / 1e6) }]} />}
    </Section>
  );
}

// ─── DENSITY CALCULATOR (ENHANCED) ──────────────────────────────────────────
function RhoC() {
  const [mode, setMode] = useState("mass");
  const [volMode, setVolMode] = useState("dims"); // "dims" = L×W×H, "direct" = volume diretto
  const [rho, setRho] = useState("1550");
  const [vol, setVol] = useState("1000");
  const [dimL, setDimL] = useState("500");
  const [dimW, setDimW] = useState("300");
  const [dimH, setDimH] = useState("2");
  const [dimUnit, setDimUnit] = useState("mm");
  const [mass, setMass] = useState("");
  const [pre, setPre] = useState("");

  // Compute effective volume in cm³
  const effectiveVol = useMemo(() => {
    if (volMode === "direct") return parseFloat(vol);
    const l = parseFloat(dimL), w = parseFloat(dimW), h = parseFloat(dimH);
    if (isNaN(l) || isNaN(w) || isNaN(h)) return NaN;
    const volRaw = l * w * h; // in dimUnit³
    // Convert to cm³
    const toCm = { mm: 0.1, cm: 1, m: 100, in: 2.54, ft: 30.48 };
    const f = toCm[dimUnit] || 0.1;
    return volRaw * f * f * f;
  }, [volMode, vol, dimL, dimW, dimH, dimUnit]);

  const dimVolDisplay = useMemo(() => {
    if (isNaN(effectiveVol)) return null;
    return { cm3: effectiveVol, mm3: effectiveVol * 1e3, L: effectiveVol / 1e3 };
  }, [effectiveVol]);

  const res = useMemo(() => {
    const d = parseFloat(rho), m = parseFloat(mass), v = effectiveVol;
    if (mode === "mass") {
      if (isNaN(d) || isNaN(v)) return null;
      const kg = d * v * 1e-6;
      return { v: kg * 1000, u: "g", f: "m = ρ · V", x: [{ label: "kg", value: fmt(kg) }, { label: "lb", value: fmt(kg * 2.205) }] };
    }
    if (mode === "density") {
      if (isNaN(m) || isNaN(v) || v === 0) return null;
      const r = (m / 1000) / (v * 1e-6);
      return { v: r, u: "kg/m³", f: "ρ = m / V", x: [{ label: "g/cm³", value: fmt(r / 1000) }] };
    }
    if (mode === "volume") {
      if (isNaN(m) || isNaN(d) || d === 0) return null;
      const vv = (m / 1000) / d * 1e6;
      return { v: vv, u: "cm³", f: "V = m / ρ", x: [{ label: "mm³", value: fmt(vv * 1e3) }, { label: "L", value: fmt(vv / 1000) }] };
    }
    return null;
  }, [mode, rho, effectiveVol, mass]);

  const showVolInput = mode !== "volume";

  return (
    <Section title="Densità / Peso">
      <Row>
        <SegControl value={mode} onChange={setMode} options={[{ id: "mass", label: "→ Massa" }, { id: "density", label: "→ Densità" }, { id: "volume", label: "→ Volume" }]} />
      </Row>

      <Row>
        <Sel label="Preset Materiale" value={pre} onChange={v => { setPre(v); if (MATS[v]) setRho(String(MATS[v].density)); }}
          options={[{ value: "", label: "— Seleziona —" }, ...Object.entries(MATS).map(([k, v]) => ({ value: k, label: `${v.label}  (${v.density} kg/m³)` }))]} />
      </Row>

      {mode !== "density" && (
        <Row>
          <FieldStack label="Densità (kg/m³)" value={rho} onChange={setRho} unit="kg/m³" />
        </Row>
      )}

      {showVolInput && (
        <>
          <Row>
            <SegControl value={volMode} onChange={setVolMode} options={[{ id: "dims", label: "L × W × H" }, { id: "direct", label: "Volume diretto" }]} />
          </Row>
          {volMode === "dims" ? (
            <Row>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Sel label="Unità dimensioni" value={dimUnit} onChange={setDimUnit} options={[{ value: "mm", label: "mm" }, { value: "cm", label: "cm" }, { value: "m", label: "m" }, { value: "in", label: "in" }, { value: "ft", label: "ft" }]} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <FieldStack label={`L (${dimUnit})`} value={dimL} onChange={setDimL} />
                  <FieldStack label={`W (${dimUnit})`} value={dimW} onChange={setDimW} />
                  <FieldStack label={`H (${dimUnit})`} value={dimH} onChange={setDimH} />
                </div>
                {dimVolDisplay && (
                  <div style={{ fontSize: 13, color: T.labelTer, padding: "4px 0" }}>
                    Volume: <span style={{ fontWeight: 600, color: T.label }}>{fmt(dimVolDisplay.cm3)}</span> cm³
                    <span style={{ margin: "0 6px", color: T.sep }}>|</span>
                    <span style={{ fontWeight: 600, color: T.label }}>{fmt(dimVolDisplay.mm3)}</span> mm³
                  </div>
                )}
              </div>
            </Row>
          ) : (
            <Row>
              <FieldStack label="Volume (cm³)" value={vol} onChange={setVol} unit="cm³" />
            </Row>
          )}
        </>
      )}

      {mode !== "mass" && (
        <Row sep={false}>
          <FieldStack label="Massa (g)" value={mass} onChange={setMass} unit="g" />
        </Row>
      )}

      {res && <Res value={fmt(res.v)} unit={res.u} formula={res.f} extra={res.x} />}
    </Section>
  );
}

function LamC() {
  const [v, sv] = useState({ n: "8", t: "0.2", w: "500", h: "300", d: "1550", rc: "40" });
  const s = (k, x) => sv(p => ({ ...p, [k]: x }));
  const res = useMemo(() => { const n = parseInt(v.n), t = parseFloat(v.t), w = parseFloat(v.w), h = parseFloat(v.h), d = parseFloat(v.d), rc = parseFloat(v.rc); if ([n, t, w, h, d].some(isNaN)) return null; const thk = n * t, vol = w * h * thk, mg = d * vol * 1e-9 * 1000; return [{ label: "Spessore", value: fmt(thk), unit: "mm" }, { label: "Massa", value: fmt(mg), unit: "g" }, { label: "Massa", value: fmt(mg / 1000), unit: "kg" }, { label: "Fraz. fibra", value: isNaN(rc) ? "—" : fmt(100 - rc), unit: "%wt" }]; }, [v]);
  return (
    <Section title="Laminato">
      <Row sep={false}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><FieldStack label="N° Plies" value={v.n} onChange={x => s("n", x)} /><FieldStack label="Spess. ply (mm)" value={v.t} onChange={x => s("t", x)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><FieldStack label="Larg. (mm)" value={v.w} onChange={x => s("w", x)} /><FieldStack label="Alt. (mm)" value={v.h} onChange={x => s("h", x)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><FieldStack label="ρ (kg/m³)" value={v.d} onChange={x => s("d", x)} /><FieldStack label="% Resina" value={v.rc} onChange={x => s("rc", x)} /></div>
        </div>
      </Row>
      {res && <Stats items={res} />}
    </Section>
  );
}

function SigC() {
  const [mode, setMode] = useState("fa");
  const [v, sv] = useState({ F: "10", Fu: "kN", A: "100", Au: "mm²", E: "130", eps: "0.005" });
  const s = (k, x) => sv(p => ({ ...p, [k]: x }));
  const res = useMemo(() => { if (mode === "fa") { const F = parseFloat(v.F), A = parseFloat(v.A); if (isNaN(F) || isNaN(A) || A === 0) return null; const Fn = F * (CATS.force.units[v.Fu]?.factor || 1), Am = A * (CATS.area.units[v.Au]?.factor || 1), sg = Fn / Am; return { v: fmt(sg / 1e6), u: "MPa", f: "σ = F / A", x: [{ label: "GPa", value: fmt(sg / 1e9) }, { label: "psi", value: fmt(sg / 6894.76) }, { label: "ksi", value: fmt(sg / 6.89476e6) }] }; } const E = parseFloat(v.E), eps = parseFloat(v.eps); if (isNaN(E) || isNaN(eps)) return null; const sg = E * 1000 * eps; return { v: fmt(sg), u: "MPa", f: `σ = ${v.E} GPa × ${v.eps}`, x: [{ label: "GPa", value: fmt(sg / 1000) }] }; }, [mode, v]);
  return (
    <Section title="Stress / Strain">
      <Row>
        <SegControl value={mode} onChange={setMode} options={[{ id: "fa", label: "σ = F/A" }, { id: "hooke", label: "σ = E·ε" }]} />
      </Row>
      <Row sep={false}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mode === "fa" && <><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><FieldStack label="Forza" value={v.F} onChange={x => s("F", x)} /><Sel label="Unità F" value={v.Fu} onChange={x => s("Fu", x)} options={Object.entries(CATS.force.units).map(([k, u]) => ({ value: k, label: u.label }))} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><FieldStack label="Area" value={v.A} onChange={x => s("A", x)} /><Sel label="Unità A" value={v.Au} onChange={x => s("Au", x)} options={Object.entries(CATS.area.units).map(([k, u]) => ({ value: k, label: u.label }))} /></div></>}
          {mode === "hooke" && <><FieldStack label="Modulo E (GPa)" value={v.E} onChange={x => s("E", x)} /><FieldStack label="Deformazione ε" value={v.eps} onChange={x => s("eps", x)} /></>}
        </div>
      </Row>
      {res && <Res value={res.v} unit={res.u} formula={res.f} extra={res.x} />}
    </Section>
  );
}

function IneC() {
  const [sh, setSh] = useState("rect");
  const [v, sv] = useState({ b: "50", h: "100", r: "25", ri: "20", tf: "10", tw: "6" });
  const s = (k, x) => sv(p => ({ ...p, [k]: x }));
  const res = useMemo(() => { const b = parseFloat(v.b), h = parseFloat(v.h), r = parseFloat(v.r), ri = parseFloat(v.ri), tf = parseFloat(v.tf), tw = parseFloat(v.tw); if (sh === "rect" && !isNaN(b * h)) return [{ label: "Ix", value: fmt(b * h ** 3 / 12), unit: "mm⁴" }, { label: "Iy", value: fmt(h * b ** 3 / 12), unit: "mm⁴" }, { label: "Wx", value: fmt(b * h ** 2 / 6), unit: "mm³" }, { label: "Area", value: fmt(b * h), unit: "mm²" }]; if (sh === "circle" && !isNaN(r)) { const I = Math.PI * r ** 4 / 4; return [{ label: "I", value: fmt(I), unit: "mm⁴" }, { label: "W", value: fmt(Math.PI * r ** 3 / 4), unit: "mm³" }, { label: "Area", value: fmt(Math.PI * r * r), unit: "mm²" }]; } if (sh === "tube" && !isNaN(r * ri)) { const I = Math.PI * (r ** 4 - ri ** 4) / 4; return [{ label: "I", value: fmt(I), unit: "mm⁴" }, { label: "W", value: fmt(I / r), unit: "mm³" }, { label: "Area", value: fmt(Math.PI * (r * r - ri * ri)), unit: "mm²" }]; } if (sh === "hrect" && !isNaN(b * h * tf * tw)) { const bi = b - 2 * tw, hi = h - 2 * tf; if (bi <= 0 || hi <= 0) return null; const Ix = (b * h ** 3 - bi * hi ** 3) / 12; return [{ label: "Ix", value: fmt(Ix), unit: "mm⁴" }, { label: "Wx", value: fmt(Ix / (h / 2)), unit: "mm³" }, { label: "Area", value: fmt(b * h - bi * hi), unit: "mm²" }]; } return null; }, [sh, v]);
  return (
    <Section title="Momenti d'Inerzia">
      <div style={{ padding: "4px 16px 8px" }}><Chips>{[{ id: "rect", l: "Rett." }, { id: "circle", l: "Cerchio" }, { id: "tube", l: "Tubo" }, { id: "hrect", l: "Cavo" }].map(x => <Chip key={x.id} active={sh === x.id} onClick={() => setSh(x.id)}>{x.l}</Chip>)}</Chips></div>
      <Row sep={false}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sh === "rect" && <><FieldStack label="Base b (mm)" value={v.b} onChange={x => s("b", x)} /><FieldStack label="Altezza h (mm)" value={v.h} onChange={x => s("h", x)} /></>}
          {sh === "circle" && <FieldStack label="Raggio (mm)" value={v.r} onChange={x => s("r", x)} />}
          {sh === "tube" && <><FieldStack label="R est. (mm)" value={v.r} onChange={x => s("r", x)} /><FieldStack label="R int. (mm)" value={v.ri} onChange={x => s("ri", x)} /></>}
          {sh === "hrect" && <><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><FieldStack label="B (mm)" value={v.b} onChange={x => s("b", x)} /><FieldStack label="H (mm)" value={v.h} onChange={x => s("h", x)} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><FieldStack label="tf (mm)" value={v.tf} onChange={x => s("tf", x)} /><FieldStack label="tw (mm)" value={v.tw} onChange={x => s("tw", x)} /></div></>}
        </div>
      </Row>
      {res && <Stats items={res} />}
    </Section>
  );
}

// ─── MATERIALS TAB ───────────────────────────────────────────────────────────
function MatTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Confronto Materiali">
        <div style={{ padding: "2px 16px 8px", color: T.labelTer, fontSize: 13 }}>Valori tipici — consulta datasheet per uso strutturale.</div>
        {Object.entries(MATS).map(([k, m], i) => {
          const sE = m.E / (m.density / 1000), sS = m.sigma / (m.density / 1000);
          return (
            <div key={k} style={{ padding: "12px 16px", borderBottom: i < Object.keys(MATS).length - 1 ? `0.5px solid ${T.sep}` : "none" }}>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{m.label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                <div><div style={{ fontSize: 11, color: T.labelTer, fontWeight: 500 }}>ρ kg/m³</div><div style={{ fontSize: 15, fontWeight: 600 }}>{m.density}</div></div>
                <div><div style={{ fontSize: 11, color: T.labelTer, fontWeight: 500 }}>E GPa</div><div style={{ fontSize: 15, fontWeight: 600 }}>{m.E}</div></div>
                <div><div style={{ fontSize: 11, color: T.labelTer, fontWeight: 500 }}>σ MPa</div><div style={{ fontSize: 15, fontWeight: 600 }}>{m.sigma}</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6, paddingTop: 6, borderTop: `0.5px solid ${T.sep}` }}>
                <div><div style={{ fontSize: 11, color: T.labelTer, fontWeight: 500 }}>E/ρ</div><div style={{ fontSize: 15, fontWeight: 700, color: T.blue }}>{fmt(sE, 1)}</div></div>
                <div><div style={{ fontSize: 11, color: T.labelTer, fontWeight: 500 }}>σ/ρ</div><div style={{ fontSize: 15, fontWeight: 700, color: T.indigo }}>{fmt(sS, 1)}</div></div>
              </div>
            </div>
          );
        })}
      </Section>
      <div style={{ padding: "8px 4px", fontSize: 13, color: T.labelTer, textAlign: "center" }}>E/ρ = rigidezza specifica · σ/ρ = resistenza specifica</div>
    </div>
  );
}
