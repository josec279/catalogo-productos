import { useEffect, useState } from 'react'
import { getProducts, createProduct } from './api'
import { Product3DViewer } from './components/Product3DViewer'
import { ProductForm } from './components/ProductForm'
import { ChatAgent } from './components/ChatAgent'
import { ProductGrid } from './components/ProductGrid'

export default function App() {
  const [products, setProducts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setProducts(await getProducts())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(product) {
    const created = await createProduct(product)
    setProducts((prev) => [created, ...prev])
    setSelectedId(created.id)
  }

  const featured = products.find((p) => p.id === selectedId) ?? products[0]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Catálogo de <span className="text-indigo-400">Productos</span>
          </h1>
          <button onClick={load} className="text-sm text-slate-400 hover:text-slate-100">
            ↻ Recargar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <Product3DViewer product={featured} />
          <ProductForm onCreate={handleCreate} />
          <ChatAgent />
        </aside>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            Inventario {!loading && <span className="text-slate-500">({products.length})</span>}
          </h2>
          {loading && <p className="text-slate-400">Cargando productos…</p>}
          {error && (
            <p className="text-red-400">
              {error}. ¿Está corriendo la API? (el plan gratis de Render tarda ~1 min en despertar)
            </p>
          )}
          {!loading && !error && (
            <ProductGrid products={products} selectedId={featured?.id} onSelect={setSelectedId} />
          )}
        </section>
      </main>
    </div>
  )
}
