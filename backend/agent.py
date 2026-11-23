"""Agente de IA (Gemini / Google AI Studio) que consulta la base de datos.

El agente solo tiene herramientas de LECTURA sobre la tabla `products`.
No puede escribir, borrar ni ejecutar SQL libre.
"""
import os

from google import genai
from google.genai import types
from sqlalchemy import func
from sqlalchemy.orm import Session

import models

# Modelo gratuito de Google AI Studio. Configurable por variable de entorno.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

SYSTEM_PROMPT = (
    "Eres el asistente de un catálogo de productos. Responde siempre en español, "
    "de forma breve y clara. Para responder sobre productos, precios o stock DEBES "
    "usar las herramientas disponibles; no inventes datos. Si no hay resultados, dilo."
)


def _row(p: models.Product) -> dict:
    return {"id": p.id, "name": p.name, "price": p.price, "stock": p.stock}


def _build_tools(db: Session):
    """Herramientas de solo lectura ligadas a la sesión de BD actual."""

    def buscar_productos(texto: str = "") -> list[dict]:
        """Busca productos cuyo nombre contenga el texto. Sin texto, lista todos (máx. 50)."""
        q = db.query(models.Product)
        if texto:
            q = q.filter(models.Product.name.ilike(f"%{texto}%"))
        return [_row(p) for p in q.order_by(models.Product.id.desc()).limit(50).all()]

    def productos_con_poco_stock(umbral: int = 5) -> list[dict]:
        """Lista los productos con stock menor o igual al umbral (por defecto 5)."""
        q = db.query(models.Product).filter(models.Product.stock <= umbral)
        return [_row(p) for p in q.order_by(models.Product.stock).limit(50).all()]

    def producto_mas_caro_y_mas_barato() -> dict:
        """Devuelve el producto más caro y el más barato del catálogo."""
        caro = db.query(models.Product).order_by(models.Product.price.desc()).first()
        barato = db.query(models.Product).order_by(models.Product.price.asc()).first()
        return {
            "mas_caro": _row(caro) if caro else None,
            "mas_barato": _row(barato) if barato else None,
        }

    def resumen_inventario() -> dict:
        """Resumen: total de productos, unidades en stock y valor total del inventario."""
        total, unidades, valor = db.query(
            func.count(models.Product.id),
            func.coalesce(func.sum(models.Product.stock), 0),
            func.coalesce(func.sum(models.Product.stock * models.Product.price), 0),
        ).one()
        return {
            "total_productos": total,
            "unidades_en_stock": int(unidades),
            "valor_total_inventario": float(valor),
        }

    return [buscar_productos, productos_con_poco_stock, producto_mas_caro_y_mas_barato, resumen_inventario]


def preguntar(pregunta: str, db: Session) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Falta la variable de entorno GEMINI_API_KEY")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=pregunta,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=_build_tools(db),  # el SDK ejecuta las funciones automáticamente
            temperature=0.2,
        ),
    )
    return response.text or "No pude generar una respuesta."
