import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Float } from '@react-three/drei'

// Color estable a partir del nombre del producto
function colorFromName(name = '') {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  return `hsl(${hash}, 70%, 55%)`
}

function ProductBox({ color }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4
  })
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      <RoundedBox ref={ref} args={[2, 2, 2]} radius={0.15} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
      </RoundedBox>
    </Float>
  )
}

export function Product3DViewer({ product }) {
  const color = colorFromName(product?.name)
  return (
    <div className="w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      <div className="h-64 w-full">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 5, 2]} intensity={1.2} />
          <ProductBox color={color} />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
      <div className="px-4 py-3 border-t border-slate-800">
        {product ? (
          <>
            <p className="text-slate-100 font-semibold">{product.name}</p>
            <p className="text-slate-400 text-sm">
              ${Number(product.price).toFixed(2)} · stock: {product.stock}
            </p>
          </>
        ) : (
          <p className="text-slate-400 text-sm">Aún no hay productos</p>
        )}
        <p className="text-xs text-slate-500 mt-1">Modelo 3D interactivo (rotar con el cursor)</p>
      </div>
    </div>
  )
}
