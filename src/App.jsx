import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const INITIAL_SIGNALS = [
  { id: 'S1', time: '14:28', source: 'Twitter (Anon)', text: 'G-10 mein paani aa gaya, ghar ke andar aa rha hai!', cred: 0.70 },
  { id: 'S2', time: '14:29', source: 'Twitter (Verified)', text: 'G-10 G-9 dono mein flooding hai, serious!', cred: 0.95 },
  { id: 'S3', time: '14:30', source: 'Twitter (Unverified)', text: 'Rawal Dam toot gaya!!! RUN!!!', cred: 0.10, isFalseAlarm: true },
  { id: 'S4', time: '14:30', source: 'Weather API', text: 'Rainfall 45mm/hr extreme (Islamabad)', cred: 1.00 },
  { id: 'S5', time: '14:31', source: 'Google Maps', text: 'Traffic 340% above normal, G-10', cred: 0.95 },
  { id: 'S6', time: '14:31', source: 'NDMA Sensor', text: 'Flood sensor G-10 bridge TRIGGERED', cred: 1.00 },
  { id: 'S7', time: '14:31', source: 'Emergency Telecom', text: '12 calls from G-10 in 10 minutes', cred: 0.95 },
  { id: 'S8', time: '14:32', source: 'Citizen Text', text: 'Accident Kashmir Highway near Faizabad, 2 vehicles, people badly hurt', cred: 0.85 }
];

const FULL_LOGS = [
  { time: '14:30:05', agent: 'SYSTEM', msg: 'Boot - Agents initialized.' },
  { time: '14:32:02', agent: 'SIGNAL_FUSION', msg: '8 multi-modal signals ingested, parsed.' },
  { time: '14:32:04', agent: 'CLASSIFIER', msg: 'Signals 1,2,4,5,6,7 grouped to G-10 Flood.' },
  { time: '14:32:05', agent: 'CLASSIFIER', msg: 'Signal 8 grouped to Kashmir Hwy Accident.' },
  { time: '14:32:07', agent: 'VERIFIER', msg: 'Signal 3 (Dam) credibility 0.10. Sensor cross-check = Normal. Marked FALSE_ALARM.' },
  { time: '14:32:10', agent: 'ALLOCATOR', msg: 'Conflict detected: Ambulances. Logic applied: Life-Threatening (Accident) over Property/Standby (Flood).' },
  { time: '14:32:12', agent: 'ALLOCATOR', msg: '4 Amb -> Accident; 2 Amb -> Flood. Reserve intact (2/8).' },
  { time: '14:32:15', agent: 'ORCHESTRATOR', msg: 'State chain executed (Dispatch, Traffic, Hospital ER).' },
  { time: '14:32:18', agent: 'NOTIFIER', msg: 'IESCO power cut alert sent for G-10.' },
  { time: '14:32:19', agent: 'NOTIFIER', msg: 'Public Urdu SMS alerts & False Alarm retractions broadcasted.' },
  { time: '14:32:25', agent: 'ORCHESTRATOR', msg: 'All units tracking on live map. Cycle complete.' }
];

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [signals, setSignals] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const logEndRef = useRef(null);

  const startSimulation = () => {
    setIsRunning(true);
    setStep(0);
    setSignals([]);
    setLogs([]);
  };

  useEffect(() => {
    if (!isRunning) return;

    let currentStep = step;
    if (currentStep < FULL_LOGS.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, FULL_LOGS[currentStep]]);
        
        // Populate signals based on steps
        if (currentStep === 1) {
          setSignals(INITIAL_SIGNALS);
        }

        setStep(prev => prev + 1);
      }, 1500); // 1.5s per step
      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
  }, [isRunning, step]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const hasFlood = step >= 3;
  const hasAccident = step >= 4;
  const damDebunked = step >= 5;

  return (
    <div className="app-container">
      {/* HEADER */}
      <div className="header">
        <div className="logo">
          CIRO-PK <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>v2.0 Orchestrator</span>
        </div>
        {!isRunning && step === 0 && (
          <button className="run-btn" onClick={startSimulation}>INITIATE SIMULATION</button>
        )}
        {(isRunning || step > 0) && (
          <div className="status-badge">
            {isRunning ? 'ACTIVE_MONITORING' : 'SUSTAINMENT_MODE'}
          </div>
        )}
      </div>

      {/* LEFT PANEL - SIGNAL FEED */}
      <div className="panel">
        <div className="panel-title">Signal Fusion Stream</div>
        <div className="signal-list">
          {signals.map((sig, idx) => (
            <div key={idx} className="signal-item" style={{ opacity: (sig.isFalseAlarm && damDebunked) ? 0.3 : 1 }}>
              <div className="signal-meta">
                <span>{sig.time}</span>
                <span style={{ color: 'var(--accent-orange)' }}>{sig.source}</span>
              </div>
              <div className="signal-text">{sig.text}</div>
              {step >= 5 && (
                <div className={`credibility ${sig.cred >= 0.8 ? 'cred-high' : 'cred-low'}`}>
                  {sig.isFalseAlarm && damDebunked ? 'FALSE ALARM (VERIFIED)' : `Credibility: ${sig.cred}`}
                </div>
              )}
            </div>
          ))}
          {signals.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
              Waiting for data ingestion...
            </div>
          )}
        </div>
      </div>

      {/* CENTER PANEL - MAP & RESOURCES */}
      <div className="panel" style={{ padding: '0', background: 'transparent', border: 'none', gap: '20px' }}>
        <div className="center-display" style={{ flex: 2 }}>
          <div className="radar-overlay"></div>
          {/* Map markers */}
          {hasFlood && (
            <div className="crisis-marker crisis-flood" style={{ top: '40%', left: '30%' }}>
              <div className="marker-dot"></div>
              <div className="marker-label">G-10 FLOOD</div>
            </div>
          )}
          {hasAccident && (
            <div className="crisis-marker crisis-accident" style={{ top: '65%', left: '70%' }}>
              <div className="marker-dot"></div>
              <div className="marker-label">HWY CRASH</div>
            </div>
          )}
          {step > 0 && !damDebunked && (
             <div className="crisis-marker" style={{ top: '20%', left: '80%', color: 'var(--accent-orange)' }}>
              <div className="marker-dot" style={{ background: 'var(--accent-orange)'}}></div>
              <div className="marker-label">RAWAL DAM ?</div>
            </div>
          )}
        </div>
        
        <div className="panel" style={{ flex: 1 }}>
           <div className="panel-title">Resource Allocator (ISB)</div>
           <div className="resource-grid">
              <div className="resource-card">
                 <div className="res-title">AMBULANCES</div>
                 <div className="res-value">
                   {step >= 7 ? <><span className="res-allocated">6</span> / 8</> : <><span className="res-available">0</span> / 8</>}
                 </div>
                 {step >= 7 && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>4 Accident, 2 Flood, 2 Res</div>}
              </div>
              <div className="resource-card">
                 <div className="res-title">RESCUE TEAMS</div>
                 <div className="res-value">
                   {step >= 7 ? <><span className="res-allocated">4</span> / 5</> : <><span className="res-available">0</span> / 5</>}
                 </div>
                 {step >= 7 && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>3 Flood, 1 Accident, 1 Res</div>}
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGS & TRACES */}
      <div className="panel">
        <div className="panel-title">Antigravity Trace Log</div>
        <div className="console-log">
          {logs.map((log, idx) => (
            <div key={idx} className="log-entry">
              <span className="log-time">[{log.time}]</span>{' '}
              <span className="log-agent">{log.agent}</span>:{' '}
              <span className="log-msg">{log.msg}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
        
        {step >= 11 && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '4px' }}>
            <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>PERFORMANCE METRICS</div>
            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Detection Time:</span>
                <span>{'< 2 minutes'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>False Alarm Waste:</span>
                <span>0 resources</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Public Messaging:</span>
                <span>Targeted (Urdu)</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
