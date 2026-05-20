import { useEffect, useState } from 'react'

type MidiEvent = {
  note: number
  padName: string
  velocity: number
  time: string
}

const PAD_MAP: Record<number, string> = {
  36: 'Kick',
  38: 'Snare',
  40: 'Snare Rim',
  42: 'Closed Hi-Hat',
  86: 'Half-Open Hi-Hat',  
  44: 'Hi-Hat Pedal',
  46: 'Open Hi-Hat',
  48: 'Tom 1',
  50: 'Tom 1 Rim',
  45: 'Tom 2',
  47: 'Tom 2 Rim',
  43: 'Tom 3',
  58: 'Tom 3 Rim',
  49: 'Crash',
  51: 'Ride',
}

function App() {
  const [events, setEvents] = useState<MidiEvent[]>([])
  const [status, setStatus] = useState('Waiting for MIDI access...')

  useEffect(() => {
    navigator.requestMIDIAccess().then((midiAccess) => {
      setStatus('MIDI connected! Hit a pad.')

      for (const input of midiAccess.inputs.values()) {
        input.onmidimessage = (message) => {
          if (!message.data) return
          const [status, note, velocity] = message.data

          if (status >= 144 && status <= 159 && velocity > 0) {
            const newEvent: MidiEvent = {
              note,
              padName: PAD_MAP[note] ?? `Unknown (${note})`,
              velocity,
              time: new Date().toLocaleTimeString(),
            }
            setEvents((prev) => [newEvent, ...prev.slice(0, 19)])
          }
        }
      }

    }).catch(() => {
      setStatus('Could not get MIDI access. Are you on Chrome?')
    })
  }, [])

  return (
    <div>
      <h1>MIDI Drum Visualizer</h1>
      <p>{status}</p>

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Pad</th>
            <th>Note #</th>
            <th>Velocity</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td>{e.time}</td>
              <td>{e.padName}</td>
              <td>{e.note}</td>
              <td>{e.velocity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App