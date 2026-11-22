import os
from typing import List

import requests
from fastapi import BackgroundTasks, Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

# Crea la tabla en Supabase automáticamente si aún no existe
models.Base.metadata.create_all(bind=engine)

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

app = FastAPI(
    title="API de Catálogo de Productos",
    version="1.0.0",
    description="Servicio Backend conectado a PostgreSQL en Supabase",
)

# Habilitar CORS para permitir llamadas desde Vercel o desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción puedes acotarlo al dominio de Vercel
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def notificar_slack(producto: schemas.ProductResponse) -> None:
    """Envía un aviso al canal de Slack (si hay webhook configurado)."""
    if not SLACK_WEBHOOK_URL:
        return
    texto = (
        f":package: ¡Nuevo producto registrado en el inventario!\n"
        f"*{producto.name}* — ${producto.price:.2f} — stock: {producto.stock}"
    )
    try:
        requests.post(SLACK_WEBHOOK_URL, json={"text": texto}, timeout=5)
    except requests.RequestException as e:
        print(f"[slack] No se pudo enviar la notificación: {e}")


@app.get("/", tags=["Salud"])
def health():
    return {"status": "ok", "docs": "/docs"}


# 1. Obtener todos los productos
@app.get("/api/v1/products", response_model=List[schemas.ProductResponse], tags=["Productos"])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.id.desc()).all()


# 2. Registrar un nuevo producto
@app.post(
    "/api/v1/products",
    response_model=schemas.ProductResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Productos"],
)
def create_product(
    product: schemas.ProductCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    nuevo_producto = models.Product(**product.model_dump())
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    respuesta = schemas.ProductResponse.model_validate(nuevo_producto)
    background_tasks.add_task(notificar_slack, respuesta)
    return respuesta
