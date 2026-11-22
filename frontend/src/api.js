const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const PRODUCTS = `${API_URL}/api/v1/products`

export async function getProducts() {
  const res = await fetch(PRODUCTS)
  if (!res.ok) throw new Error(`Error ${res.status} al obtener productos`)
  return res.json()
}

export async function createProduct(product) {
  const res = await fetch(PRODUCTS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Error ${res.status} al crear producto: ${detail}`)
  }
  return res.json()
}
