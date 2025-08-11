import React, { useEffect, useMemo, useState } from "react";

// --- Tiny SVG icons (no deps)
function Sun({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="5" fill="#f6c84c" />
      <g stroke="#f6c84c" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/>
        <path d="M4.2 4.2l1.5 1.5"/><path d="M18.3 18.3l1.5 1.5"/>
        <path d="M4.2 19.8l1.5-1.5"/><path d="M18.3 5.7l1.5-1.5"/>
      </g>
    </svg>
  );
}
function Partly({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <Sun size={18} />
      <g transform="translate(6,6)">
        <path d="M4 10h7a3 3 0 0 0 0-6 4 4 0 0 0-7-.8A3.5 3.5 0 0 0 4 10Z" fill="#cfd6e3"/>
      </g>
    </svg>
  );
}
function LightRain({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 12h9a3.5 3.5 0 0 0 0-7 5.5 5.5 0 0 0-10.3 1.8A3.8 3.8 0 0 0 6 12Z" fill="#cfd6e3"/>
      <g stroke="#65aaf7" strokeWidth="2" strokeLinecap="round">
        <path d="M8 16l-1 2"/><path d="M12 16l-1 2"/><path d="M16 16l-1 2"/>
      </g>
    </svg>
  );
}
const ICONS = { "Sunny": Sun, "Partly Cloudy": Partly, "Light Rain": LightRain };

// --- Helpers (map provider text → our buckets)
function normalizeCondition(desc = "", cloudsPct = 0) {
  const s = desc.toLowerCase();
  if (s.includes("snow")) return "Snow";
  if (s.includes("thunder")) return "Rain";
  if (s.includes("drizzle") || s.includes("light rain") || s.includes("patchy rain")) return "Light Rain";
  if (s.includes("rain")) return "Rain";
  if (s.includes("clear") || s.includes("sunny")) return "Sunny";
  if (s.includes("cloud")) return "Partly Cloudy";
  if (cloudsPct < 15) return "Sunny";
  if (cloudsPct < 70) return "Partly Cloudy";
  return "Partly Cloudy";
}
function impactFromCondition(cond) {
  switch (cond) {
    case "Light Rain": return -12;
    case "Rain": return -18;
    case "Snow": return -22;
    case "Partly Cloudy": return -4;
    case "Sunny": return 0;
    default: return -6;
  }
}
// Fallback mock
function fakeWeather() {
  const today = new Date();
  const days = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i);
    return d.toLocaleDateString("en-CA", { weekday: "short" });
  });
  return {
    condition: "Light Rain",
    impactNowPct: -12,
    impactDeltaPct: +2,
    forecast: [
      { day: days[0], icon: "Partly Cloudy", hi: 17, lo: 6 },
      { day: days[1], icon: "Partly Cloudy", hi: 13, lo: 6 },
      { day: days[2], icon: "Sunny",          hi: 12, lo: 4 },
    ],
  };
}

export default function WeatherImpactCard({ lat = 43.67, lng = -79.42 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const key = process.env.REACT_APP_WEATHER_API_KEY;
      try {
        if (!key) throw new Error("Missing REACT_APP_WEATHER_API_KEY");

        // WeatherAPI: current + 3-day forecast (metric by default)
        const url =
          `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(key)}` +
          `&q=${lat},${lng}&days=3&aqi=no&alerts=no`;

        const res = await fetch(url);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        const json = await res.json();

        // Current condition
        const curr = json.current || {};
        const conditionText = curr.condition?.text || "";
        const cloudsApprox = typeof curr.cloud === "number" ? curr.cloud : (conditionText.toLowerCase().includes("cloud") ? 50 : 0);
        const condition = normalizeCondition(conditionText, cloudsApprox);
        const impactNowPct = impactFromCondition(condition);

        // Forecast (today + next 2)
        const days = (json.forecast?.forecastday || []).slice(0, 3).map(fd => {
          const day = new Date(fd.date).toLocaleDateString("en-CA", { weekday: "short" });
          const iconText = fd.day?.condition?.text || "";
          const cloudsGuess = iconText.toLowerCase().includes("cloud") ? 50 : 0;
          const icon = normalizeCondition(iconText, cloudsGuess);
          return {
            day,
            icon,
            hi: Math.round(fd.day?.maxtemp_c ?? 0),
            lo: Math.round(fd.day?.mintemp_c ?? 0),
          };
        });

        const tomorrowIcon = days[1]?.icon || condition;
        const impactTomorrow = impactFromCondition(tomorrowIcon);
        const impactDeltaPct = impactTomorrow - impactNowPct;

        if (!cancelled) setData({ condition, impactNowPct, impactDeltaPct, forecast: days });
      } catch (e) {
        console.warn("[WeatherImpact] Using fake data:", e?.message || e);
        if (!cancelled) setData(fakeWeather());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lat, lng]);

  const Icon = useMemo(() => ICONS[data?.condition || "Light Rain"] || LightRain, [data]);

  if (loading || !data) return <div className="bento-card weather-impact-card">Loading weather…</div>;

  const sign = data.impactNowPct > 0 ? "+" : "";
  const expSign = data.impactDeltaPct > 0 ? "+" : "";
  const expUp = data.impactDeltaPct > 0;

  return (
    <div className="bento-card weather-impact-card">
      <div className="wi-header">Weather Impact</div>

      <div className="wi-top">
        <div className="wi-icon"><Icon /></div>
        <div className="wi-info">
          <div className="wi-cond">{data.condition}</div>
          <div className="wi-impact">{sign}{data.impactNowPct}%</div>
          <div className={`wi-pill ${expUp ? "up" : "down"}`}>
            <span className="arrow">{expUp ? "▲" : "▼"}</span>
            {expSign}{Math.abs(data.impactDeltaPct)}%&nbsp;EXPECTED
          </div>
        </div>
      </div>

      <div className="wi-forecast">
        {data.forecast.map((d, i) => {
          const I = ICONS[d.icon] || Sun;
          return (
            <div className="wi-day" key={i}>
              <div className="d-label">{d.day}</div>
              <div className="d-icon"><I size={22} /></div>
              <div className="d-temp-hi">{d.hi}°</div>
              <div className="d-temp-lo">{d.lo}°</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
