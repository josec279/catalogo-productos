import { useState } from 'react'

const EMPTY = { name: '', price: '', stock: '', image_url: '' }

export function ProductForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onCreate({
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock || 0),
        image_url: form.image_url.trim() || null,
      })
      setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const input =
    'w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <form onSubmit={submit} className="space-y-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-slate-100">Registrar producto</h2>
      <input name="name" value={form.name} onChange={update} placeholder="Nombre" required className={input} />
      <div className="grid grid-cols-2 gap-3">
        <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={update} placeholder="Precio" required className={input} />
        <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={update} placeholder="Stock" className={input} />
      </div>
      <input name="image_url" type="url" value={form.image_url} onChange={update} placeholder="URL de imagen (opcional)" className={input} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2 transition"
      >
        {saving ? 'Guardando…' : 'Agregar producto'}
      </button>
    </form>
  )
}
