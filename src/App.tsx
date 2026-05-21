import { useEffect, useState } from 'react'

type MidiEvent = {
  id: number
  note: number
  padName: string
  velocity: number
  time: string
}

type PadColor = {
  text: string
  bar: string
  glow: string
  dim: string
}

const PAD_MAP: Record<number, string> = {
  36: 'Kick',
  38: 'Snare',
  40: 'Snare Rim',
  42: 'Closed Hi-Hat',
  44: 'Hi-Hat Pedal',
  46: 'Open Hi-Hat',
  86: 'Half-Open Hi-Hat',
  48: 'Tom 1',
  50: 'Tom 1 Rim',
  45: 'Tom 2',
  47: 'Tom 2 Rim',
  43: 'Tom 3',
  58: 'Tom 3 Rim',
  49: 'Crash',
  51: 'Ride',
}

const COLORS: Record<string, PadColor> = {
  'Kick':             { text: '#f87171', bar: '#ef4444', glow: 'rgba(239,68,68,0.25)',   dim: 'rgba(239,68,68,0.07)'   },
  'Snare':            { text: '#f1f5f9', bar: '#e2e8f0', glow: 'rgba(226,232,240,0.25)', dim: 'rgba(226,232,240,0.05)' },
  'Snare Rim':        { text: '#94a3b8', bar: '#64748b', glow: 'rgba(100,116,139,0.25)', dim: 'rgba(100,116,139,0.05)' },
  'Closed Hi-Hat':    { text: '#fbbf24', bar: '#f59e0b', glow: 'rgba(245,158,11,0.25)',  dim: 'rgba(245,158,11,0.07)'  },
  'Hi-Hat Pedal':     { text: '#fcd34d', bar: '#fbbf24', glow: 'rgba(251,191,36,0.25)',  dim: 'rgba(251,191,36,0.06)'  },
  'Open Hi-Hat':      { text: '#fde68a', bar: '#fcd34d', glow: 'rgba(252,211,77,0.25)',  dim: 'rgba(252,211,77,0.06)'  },
  'Half-Open Hi-Hat': { text: '#fef08a', bar: '#facc15', glow: 'rgba(250,204,21,0.25)',  dim: 'rgba(250,204,21,0.06)'  },
  'Tom 1':            { text: '#60a5fa', bar: '#3b82f6', glow: 'rgba(59,130,246,0.25)',  dim: 'rgba(59,130,246,0.07)'  },
  'Tom 1 Rim':        { text: '#93c5fd', bar: '#60a5fa', glow: 'rgba(96,165,250,0.25)',  dim: 'rgba(96,165,250,0.06)'  },
  'Tom 2':            { text: '#34d399', bar: '#10b981', glow: 'rgba(16,185,129,0.25)',  dim: 'rgba(16,185,129,0.07)'  },
  'Tom 2 Rim':        { text: '#6ee7b7', bar: '#34d399', glow: 'rgba(52,211,153,0.25)',  dim: 'rgba(52,211,153,0.06)'  },
  'Tom 3':            { text: '#2dd4bf', bar: '#14b8a6', glow: 'rgba(20,184,166,0.25)',  dim: 'rgba(20,184,166,0.07)'  },
  'Tom 3 Rim':        { text: '#5eead4', bar: '#2dd4bf', glow: 'rgba(45,212,191,0.25)',  dim: 'rgba(45,212,191,0.06)'  },
  'Crash':            { text: '#c084fc', bar: '#a855f7', glow: 'rgba(168,85,247,0.25)',  dim: 'rgba(168,85,247,0.07)'  },
  'Ride':             { text: '#818cf8', bar: '#6366f1', glow: 'rgba(99,102,241,0.25)',  dim: 'rgba(99,102,241,0.07)'  },
}

const DEFAULT_COLOR: PadColor = {
  text: '#94a3b8', bar: '#475569', glow: 'rgba(71,85,105,0.2)', dim: 'rgba(71,85,105,0.05)'
}

function getColor(padName: string): PadColor {
  return COLORS[padName] ?? DEFAULT_COLOR
}

let uid = 0

export default function App() {
  const [events, setEvents]     = useState<MidiEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [lastHit, setLastHit]   = useState<MidiEvent | null>(null)
  const [flashKey, setFlashKey] = useState(0)

  useEffect(() => {
    navigator.requestMIDIAccess().then((access) => {
      setConnected(true)
      for (const input of access.inputs.values()) {
        input.onmidimessage = (msg) => {
          if (!msg.data) return
          const [st, note, vel] = msg.data
          if (st >= 144 && st <= 159 && vel > 0) {
            const ev: MidiEvent = {
              id: uid++,
              note,
              padName: PAD_MAP[note] ?? `Note ${note}`,
              velocity: vel,
              time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            }
            setLastHit(ev)
            setFlashKey(k => k + 1)
            setEvents(prev => [ev, ...prev.slice(0, 19)])
          }
        }
      }
    }).catch(() => setConnected(false))
  }, [])

  const c = lastHit ? getColor(lastHit.padName) : DEFAULT_COLOR
  const velPct = lastHit ? Math.round((lastHit.velocity / 127) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#07090e' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontFamily: "'Chakra Petch', sans-serif", letterSpacing: '0.15em',
                     fontSize: '0.9rem', color: '#475569' }}>
          MIDI DRUM VISUALIZER
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full"
               style={{ background: connected ? '#4ade80' : '#ef4444',
                        boxShadow: connected ? '0 0 8px #4ade80' : 'none' }} />
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#374151',
                         fontFamily: "'Chakra Petch', sans-serif" }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center py-16 px-8"
           style={{ background: lastHit ? c.dim : 'transparent', transition: 'background 0.4s ease' }}>
        {lastHit ? (
          <div key={flashKey} className="hit-flash flex flex-col items-center gap-5 w-full max-w-sm">
            <p style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: '0.65rem',
                        letterSpacing: '0.25em', color: '#374151' }}>
              LAST HIT
            </p>
            <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: '3rem', fontWeight: 700,
                         color: c.text, textShadow: `0 0 40px ${c.glow}`, letterSpacing: '0.06em',
                         lineHeight: 1 }}>
              {lastHit.padName.toUpperCase()}
            </h2>
            <div className="w-full flex flex-col gap-2">
              <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-1.5 rounded-full transition-all duration-100"
                     style={{ width: `${velPct}%`, background: c.bar,
                              boxShadow: `0 0 10px ${c.glow}` }} />
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: '0.6rem', color: '#374151',
                               fontFamily: "'Chakra Petch', sans-serif", letterSpacing: '0.12em' }}>
                  VELOCITY
                </span>
                <span style={{ fontSize: '0.6rem', color: c.text,
                               fontFamily: "'Chakra Petch', sans-serif", letterSpacing: '0.12em' }}>
                  {lastHit.velocity} / 127
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: '0.65rem',
                      letterSpacing: '0.25em', color: '#1f2937' }}>
            HIT A PAD TO BEGIN
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="px-8">
        <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* Feed */}
      <div className="flex-1 px-8 py-6">
        <p style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: '0.6rem',
                    letterSpacing: '0.25em', color: '#1f2937', marginBottom: '1rem' }}>
          RECENT HITS
        </p>
        <div className="flex flex-col gap-1">
          {events.map((e, i) => {
            const ec = getColor(e.padName)
            const ep = Math.round((e.velocity / 127) * 100)
            return (
              <div key={e.id}
                   className="slide-in flex items-center gap-4 px-4 py-3 rounded-lg"
                   style={{
                     background: i === 0 ? ec.dim : 'transparent',
                     opacity: Math.max(1 - i * 0.04, 0.3),
                     borderLeft: `2px solid ${i === 0 ? ec.bar : 'transparent'}`,
                   }}>
                <span style={{ fontSize: '0.6rem', color: '#374151',
                               fontFamily: "'Space Mono', monospace", minWidth: '72px' }}>
                  {e.time}
                </span>
                <span style={{ fontSize: '0.75rem', color: ec.text,
                               fontFamily: "'Chakra Petch', sans-serif",
                               fontWeight: 600, minWidth: '150px' }}>
                  {e.padName}
                </span>
                <div className="flex-1 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-0.5 rounded-full"
                       style={{ width: `${ep}%`, background: ec.bar }} />
                </div>
                <span style={{ fontSize: '0.6rem', color: '#374151',
                               fontFamily: "'Space Mono', monospace",
                               minWidth: '28px', textAlign: 'right' }}>
                  {e.velocity}
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}