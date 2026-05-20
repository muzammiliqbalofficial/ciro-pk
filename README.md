# CIRO-PK: Crisis Intelligence & Response Orchestrator

Submission prototype for **#AISeekho 2026 Google Antigravity Hackathon - Challenge 3**.

CIRO-PK fuses multi-source crisis signals, classifies simultaneous incidents, predicts severity, allocates constrained emergency resources, simulates coordinated response actions, and recovers from misinformation — all orchestrated through **5 independent Gemini AI agent calls** on Google Agent Platform (Vertex AI).

## What The Demo Shows

- **Multi-source signal fusion**: social/citizen posts, weather API, traffic data, NDMA sensor, emergency calls (8 signals, 5 sources).
- **Two simultaneous crises**: G-10 urban flood and Kashmir Highway road accident — competing for the same limited resources.
- **False alarm handling**: Rawal Dam breach rumor (credibility 0.10) is cross-checked against NDMA sensor data, verified as false, and publicly retracted.
- **Multi-agent Gemini reasoning**: 5 separate Gemini 3.1 Flash Lite Preview calls — CLASSIFIER, PREDICTOR, VERIFIER, ALLOCATOR, ORCHESTRATOR — each making independent AI decisions.
- **Resource optimization**: ambulances, rescue teams, police units, and water tankers allocated with severity-based priority and 20% reserve constraint.
- **5-step action chain**: dispatch → traffic reroute → hospital alert → utility cutoff → public alert.
- **Outcome visualization**: before/after congestion, response improvement %, false-alarm waste avoided, stakeholder notifications.
- **Live weather integration**: OpenWeatherMap API injects real Islamabad weather as a live signal source.
- **Resilient mode**: if any Gemini call fails, system falls back to deterministic trace — demo never breaks.

## Architecture

```
Mobile App (Expo React Native)  ──┐
                                   ├──► POST /api/analyze ──► Flask Backend (Cloud Run)
Web Dashboard (Vite / React)    ──┘                                    │
                                                                        ├── SIGNAL_FUSION agent
                                                                        ├── CLASSIFIER  ──► Gemini 3.1 Flash Lite (Vertex AI)
                                                                        ├── PREDICTOR   ──► Gemini 3.1 Flash Lite (Vertex AI)
                                                                        ├── VERIFIER    ──► Gemini 3.1 Flash Lite (Vertex AI)
                                                                        ├── ALLOCATOR   ──► Gemini 3.1 Flash Lite (Vertex AI)
                                                                        ├── ORCHESTRATOR──► Gemini 3.1 Flash Lite (Vertex AI)
                                                                        ├── NOTIFIER agent
                                                                        └── GEMINI_REASONER ──► Gemini 3.1 Flash Lite (Vertex AI)
```

1. **Mobile app (Expo)**: Mandatory prototype — crisis map, agent trace log, resource cards, signal stream.
2. **Web dashboard (Vite/React)**: Optional command-center view with animated Islamabad radar map.
3. **Backend (Flask / Google Cloud Run)**: Orchestrates all agents, makes 5 Gemini calls per cycle, returns full trace.
4. **Google Agent Platform (Vertex AI)**: Core AI reasoning engine — Gemini 3.1 Flash Lite Preview powers each agent independently.
5. **OpenWeatherMap API**: Injects live Islamabad weather as a real signal source.

## Google Agent Platform Integration

Each agent makes an **independent Gemini call** with a specialized prompt:

| Agent | Gemini Role | Decision |
| --- | --- | --- |
| CLASSIFIER | Reads all signals, classifies crisis type/severity | Crisis C1 and C2 identification |
| PREDICTOR | Analyzes flood parameters, predicts spread | Affected radius, vulnerable population, peak ETA |
| VERIFIER | Cross-checks rumor against sensor data | FALSE_ALARM verdict and retraction |
| ALLOCATOR | Weighs severity vs. resources, enforces reserve | Ambulance/rescue/police assignment |
| ORCHESTRATOR | Evaluates 5-step action chain outcome | Side effects and response improvement |
| GEMINI_REASONER | Final synthesis of all agent outputs | Complete incident summary trace |

Model: `gemini-3.1-flash-lite-preview` via `aiplatform.googleapis.com/v1/projects/.../locations/global`

## Backend API

`POST /api/analyze`

Input:
```json
{
  "signals": [
    { "id": "S1", "time": "14:28", "source": "Twitter (Anon)", "text": "G-10 mein paani aa gaya", "cred": 0.7 }
  ]
}
```

Output:
- `trace`: Per-agent Gemini reasoning logs with timestamps.
- `crises`: Classified incidents with severity, confidence, radius, population.
- `allocations`: Resource assignment with priority rank and cost estimate (PKR).
- `actions`: 5-step simulated response chain with impact metrics.
- `notifications`: 5 stakeholder messages (Public, Hospital, IESCO, Media, Police).
- `false_alarms`: Verified false signals with sensor evidence.
- `mode`: `gemini_live` or `fallback_simulation`.
- `gemini_status`: Per-call Gemini status.

## Environment Variables

Root web/backend `.env`:
```env
VITE_BACKEND_URL=https://ciro-backend-840960568725.asia-south1.run.app
VITE_MAPS_KEY=optional_maps_key
GEMINI_MODEL=gemini-3.1-flash-lite-preview
GOOGLE_CLOUD_PROJECT=iro-pk-backend
OWM_API_KEY=your_openweathermap_key
```

Mobile `.env`:
```env
EXPO_PUBLIC_BACKEND_URL=https://ciro-backend-840960568725.asia-south1.run.app
EXPO_PUBLIC_MAPS_KEY=optional_maps_key
```

## Run Locally

Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Web dashboard:
```bash
npm install
npm run dev
```

Mobile:
```bash
cd ciro-pk-mobile
npm install
npx expo start
```

## Google Cloud / Credits Usage

- **Google Cloud Run** (`asia-south1`): Hosts the Flask orchestrator — auto-scales to zero when idle.
- **Vertex AI Agent Platform**: Powers all 6 Gemini agent calls using `gemini-3.1-flash-lite-preview` via global endpoint.
- **Google Maps Platform**: Traffic/map evidence simulated for prototype reliability; map background uses Islamabad satellite imagery.
- **OpenWeatherMap API**: Live Islamabad weather injected as real signal source.
- **Estimated cost per demo cycle**: ~$0.001–0.003 USD (6 short Gemini calls × ~100 tokens each).
- **Latency**: ~30–35 seconds per full cycle (6 sequential Gemini calls); parallelizable in production.

## Baseline Comparison

| Metric | Manual / Heuristic Baseline | CIRO-PK Agentic Flow |
| --- | --- | --- |
| Detection time | 15–25 minutes | Under 35 seconds (end-to-end) |
| Classification | Human dispatcher judgment | Gemini AI classification with confidence score |
| Resource allocation | First-come, first-served | Severity + urgency + 20% reserve constraint |
| False alarm response | Resources may be diverted | Sensor cross-check + public retraction in <1s |
| Stakeholder messaging | Generic, delayed | Audience-specific, multilingual (Urdu/English) |
| Side-effect detection | None | Automatic (e.g. rerouting congestion flagged) |
| Failure handling | Manual intervention | Automatic fallback preserves full demo |

## Robustness Evidence

- Gemini API failure falls back to deterministic trace — demo always completes.
- Rawal Dam false alarm (credibility 0.10) detected, verified against NDMA sensors, publicly retracted.
- Two simultaneous crises compete for limited ambulances — conflict resolved by severity priority.
- Traffic rerouting side effect detected and alternate route activated automatically.
- OpenWeatherMap unavailable → system continues with simulated weather signal.

## Privacy And Safety

All crisis signals are synthetic. No real citizen identity, phone number, live location, or emergency system is connected. Physical dispatch, utility cutoff, and public alerts are simulation-only. Irreversible real-world actions would require human approval in production.

## Scalability

- Cloud Run auto-scales horizontally; each request is stateless.
- Gemini calls can be parallelized (currently sequential for trace clarity).
- 10× scale: increase Cloud Run max instances; Vertex AI handles load automatically.
- Production would add: persistent incident DB, real NDMA/traffic API webhooks, push notification service.

## Limitations

- Traffic, NDMA sensor, telecom, and utility APIs are simulated for prototype reliability.
- All 6 Gemini calls are sequential — adds ~30s latency (parallelizable in production).
- Crisis scenarios are pre-defined for the demo; production would ingest live data streams.
