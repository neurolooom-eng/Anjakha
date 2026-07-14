import { useEffect, useRef, useState } from 'react'
import { Mic, Square } from 'lucide-react'

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** A textarea with an optional mic button that dictates into it via the browser's Web Speech
 * API. The mic button only renders in browsers that support it (Chrome/Edge); it's a progressive
 * enhancement, not a requirement — typing always works. */
export function DictationField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const [listening, setListening] = useState(false)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const baseRef = useRef('')
  const supported = typeof window !== 'undefined' && !!getRecognitionCtor()

  useEffect(() => () => recRef.current?.stop(), [])

  function toggle() {
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-IN'
    baseRef.current = value
    rec.onresult = (e) => {
      let transcript = ''
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript
      onChange((baseRef.current ? `${baseRef.current} ` : '') + transcript)
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="label !mb-0">{label}</label>
        {supported && (
          <button
            type="button"
            onClick={toggle}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              listening ? 'bg-danger/15 text-danger' : 'bg-surface-2 text-muted hover:text-text'
            }`}
          >
            {listening ? <Square size={11} /> : <Mic size={11} />} {listening ? 'Stop' : 'Dictate'}
          </button>
        )}
      </div>
      <textarea
        className="textarea"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
