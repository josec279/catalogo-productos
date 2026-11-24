export function ProductGrid({ products }) {
  if (products.length === 0) {
    return <p className="text-slate-400">No hay productos registrados todavía.</p>
  }
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <div
          key={p.id}
          className="text-left bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition hover:border-indigo-500"
        >
          <div className="h-32 bg-slate-800 flex items-center justify-center">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl">📦</span>
            )}
          </div>
          <div className="p-3">
            <p className="font-semibold text-slate-100 truncate">{p.name}</p>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-indigo-300">${Number(p.price).toFixed(2)}</span>
              <span className={p.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                {p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
