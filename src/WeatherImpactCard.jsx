import React, { useEffect, useMemo, useState } from "react";

// --- Tiny SVG icons (no deps)
function Sun({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="5" fill="#f6c84c" />
      <g stroke="#f6c84c" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v2" /><path d="M12 20v2" /><path d="M2 12h2" /><path d="M20 12h2" />
        <path d="M4.2 4.2l1.5 1.5" /><path d="M18.3 18.3l1.5 1.5" />
        <path d="M4.2 19.8l1.5-1.5" /><path d="M18.3 5.7l1.5-1.5" />
      </g>
    </svg>
  );
}
function Partly({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <Sun size={18} />
      <g transform="translate(6,6)">
        <path
          d="M4 10h7a3 3 0 0 0 0-6 4 4 0 0 0-7-.8A3.5 3.5 0 0 0 4 10Z"
          fill="#cfd6e3"
        />
      </g>
    </svg>
  );
}
function LightRain({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6 12h9a3.5 3.5 0 0 0 0-7 5.5 5.5 0 0 0-10.3 1.8A3.8 3.8 0 0 0 6 12Z"
        fill="#cfd6e3"
      />
      <g stroke="#65aaf7" strokeWidth="2" strokeLinecap="round">
        <path d="M8 16l-1 2" /><path d="M12 16l-1 2" /><path d="M16 16l-1 2" />
      </g>
    </svg>
  );
}
const ICONS = {
  Sunny: Sun,
  "Partly Cloudy": Partly,
  "Light Rain": LightRain,
};

// --- Helpers (provider text → our buckets)
function normalizeCondition(desc = "", cloudsPct = 0) {
  const s = (desc || "").toLowerCase();
  if (s.includes("haze") || s.includes("mist") || s.includes("fog") || s.includes("smoke"))
    return "Partly Cloudy";
  if (s.includes("thunder")) return "Light Rain";
  if (s.includes("drizzle") || s.includes("patchy rain") || s.includes("light rain"))
    return "Light Rain";
  if (s.includes("rain")) return "Light Rain";
  if (s.includes("snow") || s.includes("sleet")) return "Light Rain";
  if (s.includes("overcast") || s.includes("cloud")) return "Partly Cloudy";
  if (s.includes("clear") || s.includes("sunny")) return "Sunny";

  if (cloudsPct < 15) return "Sunny";
  if (cloudsPct < 70) return "Partly Cloudy";
  return "Partly Cloudy";
}

function isWeekendYMD(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay(); // 0=Sun ... 6=Sat
  return day === 0 || day === 6;
}

function formatWeekday(iso, tzId) {
  const dt = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("en-CA", { weekday: "short", timeZone: tzId }).format(dt);
}

// Fallback mock
function fakeWeather(tzId = "UTC") {
  const base = new Date();
  function nextBiz(startShift) {
    let d = new Date(base);
    d.setDate(d.getDate() + startShift);
    // move to tomorrow first
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const d1 = nextBiz(0);
  const d2 = nextBiz(1);
  const d3 = nextBiz(2);

  return {
    condition: "Sunny",
    currentC: 25,
    todayHi: 28,
    todayLo: 18,
    forecast: [
      { day: formatWeekday(d1, tzId), icon: "Sunny", hi: 28, lo: 18 },
      { day: formatWeekday(d2, tzId), icon: "Partly Cloudy", hi: 27, lo: 17 },
      { day: formatWeekday(d3, tzId), icon: "Light Rain", hi: 24, lo: 16 },
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

        // Ask for up to 7 days so we can skip weekends
        const url =
          `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(key)}` +
          `&q=${lat},${lng}&days=7&aqi=no&alerts=no`;

        const res = await fetch(url);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        const json = await res.json();

        const tzId = json.location?.tz_id || "UTC";

        // Determine "today" in the provider's local time zone
        const localDateStr =
          (json.location?.localtime || "").split(" ")[0] ||
          (json.forecast?.forecastday?.[0]?.date ?? null);

        // Current
        const curr = json.current || {};
        const conditionText = curr.condition?.text || "";
        const cloudsApprox =
          typeof curr.cloud === "number"
            ? curr.cloud
            : conditionText.toLowerCase().includes("cloud")
            ? 50
            : 0;
        const condition = normalizeCondition(conditionText, cloudsApprox);
        const currentC = Math.round(curr.temp_c ?? 0);

        // Today's actual hi/lo from provider's first day
        const todayObj = (json.forecast?.forecastday || []).find(
          (fd) => fd?.date === localDateStr
        );
        const todayHi = Math.round(todayObj?.day?.maxtemp_c ?? 0);
        const todayLo = Math.round(todayObj?.day?.mintemp_c ?? 0);

        // Build business-day sequence: **start from TOMORROW**, skip Sat/Sun
        const daysRaw = json.forecast?.forecastday || [];
        const biz = [];
        let passedToday = false;

        for (const fd of daysRaw) {
          if (!passedToday) {
            // advance until we pass "today"
            if (fd.date === localDateStr) {
              passedToday = true; // next iterations will be tomorrow+
            }
            continue;
          }

          if (isWeekendYMD(fd.date)) continue; // skip weekends

          const txt = fd.day?.condition?.text || "";
          let icon = normalizeCondition(
            txt,
            txt.toLowerCase().includes("cloud") ? 50 : 0
          );

          // prefer precip probabilities when choosing icon
          const chanceRain = Number(fd.day?.daily_chance_of_rain ?? 0);
          const chanceSnow = Number(fd.day?.daily_chance_of_snow ?? 0);
          if (chanceSnow >= 30) icon = "Light Rain";
          else if (chanceRain >= 60) icon = "Light Rain";

          biz.push({
            dateISO: fd.date,
            day: formatWeekday(fd.date, tzId),
            icon,
            hi: Math.round(fd.day?.maxtemp_c ?? 0),
            lo: Math.round(fd.day?.mintemp_c ?? 0),
          });

          if (biz.length === 3) break;
        }

        if (!cancelled) {
          setData({
            condition,
            currentC,
            todayHi,
            todayLo,
            forecast: biz, // tomorrow + next 2 business days
          });
        }
      } catch (e) {
        console.warn("[WeatherImpact] Using fake data:", e?.message || e);
        if (!cancelled) setData(fakeWeather());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  const Icon = useMemo(() => ICONS[data?.condition || "Sunny"] || Sun, [data]);

  if (loading || !data) {
    return <div className="bento-card weather-impact-card">Loading weather…</div>;
  }

  return (
    <div className="bento-card weather-impact-card">
      <div className="wi-header">Weather</div>

      <div className="wi-top">
        <div className="wi-icon"><Icon /></div>
        <div className="wi-info">
          <div className="wi-cond">{data.condition}</div>
          {/* Big number is CURRENT temperature in °C */}
          <div className="wi-impact">{data.currentC}°</div>
          {/* Show today's High/Low in the pill */}
          <div className="wi-pill">
            H: {data.todayHi}° &nbsp;·&nbsp; L: {data.todayLo}°
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
