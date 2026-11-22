from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# Base compartida
class ProductBase(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    image_url: Optional[str] = None


# Datos requeridos al crear un producto (POST)
class ProductCreate(ProductBase):
    pass


# Formato de respuesta que envía la API (incluye el id asignado por Supabase)
class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
