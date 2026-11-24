import { useRef, useEffect, useState } from 'react'
import { askAgent } from '../api'

const SUGGESTIONS = [
  '¿Qué productos tienen poco stock?',
  '¿Cuál es el producto más caro?',
  'Dame un resumen del inventario',
]

// Convierte **texto** en negrita (sin HTML crudo, solo elementos de React)
function renderText(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  )
}

export function ChatAgent() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hola 👋 Soy el asistente del catálogo. Pregúntame sobre productos, precios o stock.' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(question) {
    const q = question.trim()
    if (!q || busy) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setBusy(true)
    try {
      const answer = await askAgent(q)
      setMessages((m) => [...m, { role: 'bot', text: answer }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: `⚠️ ${err.message}`, error: true }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
      <h2 className="text-lg font-semibold text-slate-100 px-4 pt-4">Asistente IA (Gemini)</h2>

      <div className="h-64 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={`inline-block max-w-[90%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : m.error
                    ? 'bg-red-950 text-red-300'
                    : 'bg-slate-800 text-slate-100'
              }`}
            >
              {renderText(m.text)}
            </span>
          </div>
        ))}
        {busy && <p className="text-sm text-slate-500">Consultando la base de datos…</p>}
        <div ref={endRef} />
      </div>

      <div className="px-4 flex flex-wrap gap-2 pb-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={busy}
            className="text-xs rounded-full border border-slate-700 text-slate-300 px-2 py-1 hover:border-indigo-500 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex gap-2 p-4 pt-2 border-t border-slate-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta algo sobre el inventario…"
          maxLength={500}
          className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-3"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
