from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Category = Literal["granos", "molinillos", "tazas", "accesorios"]

ProductName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class OrderItemIn(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)


class OrderItemOut(BaseModel):
    product_id: int
    quantity: int


class OrderOut(BaseModel):
    id: int
    total: float
    created_at: datetime
    items: list[OrderItemOut]


class ProductBase(BaseModel):
    name: ProductName
    category: Category
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    description: str | None = None
    image: str | None = None


class ProductOut(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
