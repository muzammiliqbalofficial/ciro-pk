import { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const INITIAL_SIGNALS = [
  { id: 'S1', time: '14:28', source: 'Twitter (Anon)', text: 'G-10 mein paani aa gaya, ghar ke andar aa rha hai!', cred: 0.70 },
  { id: 'S2', time: '14:29', source: 'Twitter (Verified)', text: 'G-10 G-9 dono mein flooding hai, serious!', cred: 0.95 },
  { id: 'S3', time: '14:30', source: 'Twitter (Unverified)', text: 'Rawal Dam toot gaya!!! RUN!!!', cred: 0.10, isFalseAlarm: true },
  { id: 'S4', time: '14:30', source: 'Weather API', text: 'Rainfall 45mm/hr extreme (Islamabad)', cred: 1.00 },
  { id: 'S5', time: '14:31', source: 'Google Maps', text: 'Traffic 340% above normal, G-10', cred: 0.95 },
  { id: 'S6', time: '14:31', source: 'NDMA Sensor', text: 'Flood sensor G-10 bridge TRIGGERED', cred: 1.00 },
  { id: 'S7', time: '14:31', source: 'Emergency Telecom', text: '12 calls from G-10 in 10 minutes', cred: 0.95 },
  { id: 'S8', time: '14:32', source: 'Citizen Text', text: 'Accident Kashmir Highway near Faizabad, 2 vehicles, people badly hurt', cred: 0.85 },
];

const FALLBACK_LOGS = [
  { time: '14:30:05', agent: 'SYSTEM', msg: 'Boot - CIRO-PK Antigravity agents initialized in local fallback mode.' },
  { time: '14:32:02', agent: 'SIGNAL_FUSION', msg: '8 multi-modal signals ingested. Languages: Urdu, Roman Urdu, English.' },
  { time: '14:32:04', agent: 'CLASSIFIER', msg: 'C1 Urban Flood @ G-10 severity 8/10 confidence 93%. C2 Road Accident @ Kashmir Highway severity 9/10 confidence 87%.' },
  { time: '14:32:06', agent: 'PREDICTOR', msg: 'Flood radius 3.2km, ~18,000 people at risk, peak impact in 25 min.' },
  { time: '14:32:07', agent: 'VERIFIER', msg: 'Rawal Dam rumor credibility 0.10; NDMA sensor normal. FALSE_ALARM.' },
  { time: '14:32:10', agent: 'ALLOCATOR', msg: '4 ambulances to RTA, 2 to flood, 2 reserve. Life-threatening incident prioritized.' },
  { time: '14:32:15', agent: 'ORCHESTRATOR', msg: '5 actions executed: dispatch, reroute, hospital alert, utility cutoff, public alert.' },
  { time: '14:32:21', agent: 'NOTIFIER', msg: 'Public, hospital, IESCO, media, and police notifications generated.' },
  { time: '14:32:25', agent: 'SYSTEM', msg: 'Cycle complete. 2 crises managed. 1 false alarm neutralized.' },
];

const fallbackResult = {
  trace: FALLBACK_LOGS,
  mode: 'local_fallback',
  gemini_status: 'frontend_fallback',
  crises: [],
  allocations: [],
  actions: [],
  notifications: [],
};

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [signals, setSignals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analysis, setAnalysis] = useState(fallbackResult);
  const logEndRef = useRef(null);

  const activeTrace = useMemo(() => analysis.trace?.length ? analysis.trace : FALLBACK_LOGS, [analysis]);
  const modeLabel = analysis.mode === 'gemini_live' ? 'GEMINI_LIVE' : analysis.mode === 'fallback_simulation' ? 'BACKEND_FALLBACK' : 'LOCAL_FALLBACK';

  const startSimulation = async () => {
    setIsLoading(true);
    setIsRunning(false);
    setStep(0);
    setSignals([]);
    setLogs([{ time: '14:30:00', agent: 'SYSTEM', msg: `Calling backend orchestrator at ${BACKEND_URL}/api/analyze` }]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signals: INITIAL_SIGNALS }),
      });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const data = await response.json();
      setAnalysis({ ...fallbackResult, ...data });
      setLogs([{ time: '14:30:01', agent: 'SYSTEM', msg: `Backend connected. Mode: ${data.mode}. Gemini status: ${data.gemini_status}` }]);
    } catch (error) {
      setAnalysis({ ...fallbackResult, gemini_status: error.message });
      setLogs([{ time: '14:30:01', agent: 'SYSTEM', msg: `Backend unavailable (${error.message}). Running local resilient fallback trace.` }]);
    } finally {
      setIsLoading(false);
      setIsRunning(true);
    }
  };

  useEffect(() => {
    if (!isRunning) return undefined;
    if (step >= activeTrace.length) {
      const timer = setTimeout(() => setIsRunning(false), 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, activeTrace[step]]);
      if (step === 0) setSignals(INITIAL_SIGNALS);
      setStep((prev) => prev + 1);
    }, 850);
    return () => clearTimeout(timer);
  }, [activeTrace, isRunning, step]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const hasFlood = step >= 2;
  const hasAccident = step >= 3;
  const damDebunked = step >= 5;
  const allocated = step >= 6;
  const done = !isRunning && step >= activeTrace.length && step > 0;

  return (
    <div className="app-container">
      <div className="header">
        <div className="logo">
          CIRO-PK
        </div>
        {!isRunning && !isLoading && step === 0 && (
          <button className="run-btn" onClick={startSimulation}>INITIATE SIMULATION</button>
        )}
        {(isRunning || isLoading || step > 0) && (
          <div className="status-badge" style={{ color: done ? 'var(--accent-green)' : 'var(--accent-cyan)' }}>
            {isLoading ? 'CALLING_BACKEND' : isRunning ? 'AGENTS_ACTIVE' : modeLabel}
          </div>
        )}
        {done && (
          <button className="run-btn" style={{ marginLeft: '10px', fontSize: '11px' }} onClick={startSimulation}>
            RE-RUN
          </button>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Signal Fusion Stream ({signals.length}/8)</div>
        <div className="signal-list">
          {signals.map((sig) => {
            const retracted = sig.isFalseAlarm && damDebunked;
            return (
              <div
                key={sig.id}
                className="signal-item"
                style={{
                  opacity: retracted ? 0.25 : 1,
                  borderLeftColor: retracted ? 'var(--accent-red)' : sig.cred >= 0.9 ? 'var(--accent-green)' : sig.cred >= 0.7 ? 'var(--accent-cyan)' : 'var(--accent-red)',
                }}>
                <div className="signal-meta">
                  <span>{sig.time}</span>
                  <span style={{ color: 'var(--accent-orange)' }}>{sig.source}</span>
                </div>
                <div className="signal-text">{sig.text}</div>
                <div className={`credibility ${sig.cred >= 0.8 ? 'cred-high' : 'cred-low'}`}>
                  {retracted ? 'FALSE ALARM - RETRACTED' : `Credibility: ${sig.cred}`}
                </div>
              </div>
            );
          })}
          {signals.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
              Waiting for backend signal ingestion...
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ padding: 0, background: 'transparent', border: 'none', gap: '16px' }}>
        <div className="center-display" style={{ flex: 2 }}>
          <img src="/islamabad_radar_map.png" alt="Islamabad Map" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
          <div className="radar-overlay"></div>
          {hasFlood && (
            <div className="crisis-marker crisis-flood" style={{ top: '40%', left: '28%' }}>
              <div className="marker-dot"></div>
              <div className="marker-label">G-10 FLOOD C1</div>
            </div>
          )}
          {hasAccident && (
            <div className="crisis-marker crisis-accident" style={{ top: '65%', left: '68%' }}>
              <div className="marker-dot"></div>
              <div className="marker-label">HWY CRASH C2</div>
            </div>
          )}
          {step > 0 && !damDebunked && (
            <div className="crisis-marker" style={{ top: '18%', left: '78%', color: 'var(--accent-orange)' }}>
              <div className="marker-dot" style={{ background: 'var(--accent-orange)' }}></div>
              <div className="marker-label">RAWAL DAM ?</div>
            </div>
          )}
        </div>

        <div className="panel" style={{ flex: 1 }}>
          <div className="panel-title">Resource Allocator (ISB)</div>
          <div className="resource-grid">
            {[
              ['AMBULANCES', allocated ? '6 / 8' : '- / 8', allocated ? 'RTA + Flood + Reserve' : ''],
              ['RESCUE TEAMS', allocated ? '4 / 5' : '- / 5', allocated ? '3 Flood, 1 RTA' : ''],
              ['POLICE UNITS', allocated ? '10 / 12' : '- / 12', allocated ? 'Traffic + perimeter' : ''],
              ['WATER TANKERS', allocated ? '3 / 3' : '- / 3', allocated ? 'Flood zone' : ''],
            ].map(([title, value, sub]) => (
              <div className="resource-card" key={title}>
                <div className="res-title">{title}</div>
                <div className="res-value">{value}</div>
                {sub && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>{sub}</div>}
              </div>
            ))}
          </div>

          {hasFlood && (
            <div style={{ marginTop: '12px' }}>
              <div className="panel-title" style={{ fontSize: '11px' }}>Severity Prediction</div>
              <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', borderLeft: '3px solid #ff9e00' }}>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Urban Flood - G-10 <span style={{ color: '#ff9e00', float: 'right' }}>SEV 8/10</span></div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Radius: 3.2km - Pop: ~18,000 - Duration: 4h - Peak: 25min</div>
                </div>
                {hasAccident && (
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', borderLeft: '3px solid #ff2a5f' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Road Accident - Faizabad <span style={{ color: '#ff2a5f', float: 'right' }}>SEV 9/10</span></div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Radius: 0.5km - Multi-vehicle - Duration: 1.5h - CRITICAL</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {done && (
          <div style={{ padding: '15px', background: 'rgba(0,255,136,0.08)', border: '1px solid var(--accent-green)', borderRadius: '4px' }}>
            <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', marginBottom: '10px', fontSize: '13px' }}>OUTCOME SUMMARY</div>
            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                ['Backend Mode', modeLabel],
                ['Gemini Status', analysis.gemini_status || 'unknown'],
                ['Crises Detected', '2 (Flood + RTA)'],
                ['False Alarm', '1 caught - 0 resources wasted'],
                ['Actions Executed', '5 (Dispatch, Reroute, Hospital, Utility, Alert)'],
                ['Notifications', '5 stakeholder channels'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                  <span style={{ textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Antigravity Agent Trace Log</div>
        <div className="console-log">
          {logs.map((log, idx) => (
            <div key={`${log.time}-${idx}`} className="log-entry">
              <span className="log-time">[{log.time}]</span>{' '}
              <span className="log-agent">{log.agent}</span>:{' '}
              <span className="log-msg">{log.msg}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
