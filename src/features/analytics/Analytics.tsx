import { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiUrl } from '../../apiConfig';
import { fallbackData } from '../../types';

export function Analytics() {
  const [data, setData] = useState(fallbackData);

  useEffect(() => {
    fetch(apiUrl('/api/analytics'))
      .then(r => r.json())
      .then(d => setData(d.sessions))
      .catch(() => undefined);
  }, []);

  const latest = (data[data.length - 1] || data[0] || {
    date: 'NOW',
    star: 78,
    accuracy: 78,
    fillers: 4.3,
    pace: 145
  }) as (typeof fallbackData)[number] & { pace?: number };

  const insightCards = [
    {
      label: 'Rhythm',
      value: `${latest.pace ?? 0} WPM`,
      copy: 'Your recent sessions show a healthier speaking cadence and less drift.'
    },
    {
      label: 'Clarity',
      value: `${latest.accuracy ?? 0}%`,
      copy: 'The strongest answers connect the mechanism to the impact.'
    },
    {
      label: 'Filler drop',
      value: `${latest.fillers ?? 0} / min`,
      copy: 'You are getting quieter and more deliberate with each round.'
    }
  ];

  return (
    <main className="shell">
      <section className="studio-head">
        <div>
          <p className="kicker">02 / IMPROVEMENT IS A DATASET</p>
          <h1>
            YOUR
            <br />
            <span>RECEIPTS.</span>
          </h1>
        </div>
        <div className="session-meta">
          <b>12 SESSIONS LOGGED</b>
          <span>LAST 30 DAYS</span>
          <span>UPWARD TRAJECTORY</span>
        </div>
      </section>

      <div className="big-stats">
        <div>
          <b>82</b>
          <span>
            READINESS
            <br />
            INDEX
          </span>
        </div>
        <div>
          <b>+14</b>
          <span>
            STAR SCORE
            <br />
            THIS MONTH
          </span>
        </div>
        <div>
          <b>−65%</b>
          <span>
            FILLER WORDS
            <br />
            FROM BASELINE
          </span>
        </div>
      </div>

      <section className="analytics-grid">
        <div className="analytics-stack">
          <article className="chart-card">
            <p className="kicker">STRUCTURE × TECHNICAL DEPTH</p>
            <h2>ANSWER QUALITY</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data}>
                <CartesianGrid stroke="#1c1c1c" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line dataKey="star" stroke="#ecff00" strokeWidth={4} dot={{ r: 5, fill: '#ecff00' }} />
                <Line dataKey="accuracy" stroke="#ff4f19" strokeWidth={4} dot={{ r: 5, fill: '#ff4f19' }} />
              </LineChart>
            </ResponsiveContainer>
          </article>

          <article className="chart-card light-chart">
            <p className="kicker">SPEAKING CLEANER</p>
            <h2>FILLER DECAY</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="brute" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff4f19" stopOpacity=".7" />
                    <stop offset="100%" stopColor="#ff4f19" stopOpacity=".03" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#bbb" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area dataKey="fillers" stroke="#000" fill="url(#brute)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </article>
        </div>

        <div className="analytics-stack">
          {insightCards.map(card => (
            <article key={card.label} className="insight-card">
              <p className="kicker">INSIGHT</p>
              <h3>{card.label}</h3>
              <b>{card.value}</b>
              <p>{card.copy}</p>
            </article>
          ))}

          <article className="insight-card">
            <p className="kicker">COMMUNITY INTELLIGENCE</p>
            <h3>Where people share real interview stories</h3>
            <ul>
              <li>
                <strong>Blind</strong> — strong for company-specific round breakdowns and recruiter stories.
              </li>
              <li>
                <strong>Reddit / r/cscareerquestions</strong> — practical prep notes and failure patterns.
              </li>
              <li>
                <strong>Discord communities</strong> — useful for recent process changes and interview feedback.
              </li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
