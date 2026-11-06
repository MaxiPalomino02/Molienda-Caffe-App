from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import models
from sqlalchemy import inspect, text
from database import Base, SessionLocal, engine
from models import Product
from routers import orders, products

SEED_PRODUCTS: list[dict[str, object]] = [
    {
        "id": 1,
        "name": "Etiopía Yirgacheffe 250g",
        "category": "granos",
        "price": 9500,
        "stock": 25,
        "description": "Café de tueste claro, notas florales y cítricas",
        "image": "/products/etiopia-yirgacheffe.svg",
    },
    {
        "id": 2,
        "name": "Colombia Huila 250g",
        "category": "granos",
        "price": 8500,
        "stock": 30,
        "description": "Café de tueste medio, notas de chocolate y caramelo",
        "image": "/products/colombia-huila.svg",
    },
    {
        "id": 3,
        "name": "Brasil Cerrado 250g",
        "category": "granos",
        "price": 7800,
        "stock": 40,
        "description": "Café de tueste medio-oscuro, notas de nuez y cacao",
        "image": "/products/brasil-cerrado.svg",
    },
    {
        "id": 4,
        "name": "Blend de la casa 1kg",
        "category": "granos",
        "price": 24000,
        "stock": 15,
        "description": "Mezcla equilibrada, ideal para espresso",
        "image": "/products/blend-de-la-casa.svg",
    },
    {
        "id": 5,
        "name": "Molinillo manual",
        "category": "molinillos",
        "price": 32000,
        "stock": 12,
        "description": "Molinillo manual con muelas de acero",
        "image": "/products/molinillo-manual.svg",
    },
    {
        "id": 6,
        "name": "Molinillo eléctrico",
        "category": "molinillos",
        "price": 58000,
        "stock": 8,
        "description": "Molienda regulable para filtrado y espresso",
        "image": "/products/molinillo-electrico.svg",
    },
    {
        "id": 7,
        "name": "Taza de cerámica 250ml",
        "category": "tazas",
        "price": 6500,
        "stock": 35,
        "description": "Taza artesanal color arena",
        "image": "/products/taza-ceramica-250.svg",
    },
    {
        "id": 8,
        "name": "Taza espresso 90ml",
        "category": "tazas",
        "price": 4800,
        "stock": 50,
        "description": "Taza chica de cerámica para espresso",
        "image": "/products/taza-espresso-90.svg",
    },
    {
        "id": 9,
        "name": "Filtros de papel x100",
        "category": "accesorios",
        "price": 3200,
        "stock": 60,
        "description": "Filtros de papel para cafetera de filtrado",
        "image": "/products/filtros-papel-x100.svg",
    },
    {
        "id": 10,
        "name": "Balanza digital",
        "category": "accesorios",
        "price": 21000,
        "stock": 10,
        "description": "Balanza con temporizador para café de filtrado",
        "image": "/products/balanza-digital.svg",
    },
]


def ensure_image_column() -> None:
    """Agrega la columna image a bases existentes y completa las fotos de los productos del seed."""
    columns = [c["name"] for c in inspect(engine).get_columns("products")]
    if "image" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE products ADD COLUMN image VARCHAR"))
    db = SessionLocal()
    try:
        for seed in SEED_PRODUCTS:
            product = db.get(Product, seed["id"])
            if product is not None and product.image is None:
                product.image = str(seed["image"])
        db.commit()
    finally:
        db.close()


def seed_products() -> None:
    db = SessionLocal()
    try:
        if db.query(Product).first() is not None:
            return
        db.add_all([Product(**product) for product in SEED_PRODUCTS])
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    ensure_image_column()
    seed_products()
    yield


app = FastAPI(title="Molienda Café API", lifespan=lifespan)


def validation_message(error: dict[str, object]) -> str:
    loc = error.get("loc", [])
    field = str(loc[-1]) if loc else "dato"
    error_type = error.get("type")

    if error_type == "too_short" and field == "items":
        return "El pedido debe incluir al menos un producto"
    if error_type == "string_too_short" and field == "name":
        return "El nombre del producto no puede estar vacío"
    if error_type == "literal_error" and field == "category":
        return (
            "Categoría inválida. Valores permitidos: "
            "granos, molinillos, tazas, accesorios"
        )
    if error_type == "missing":
        return f"Falta el campo '{field}'"
    if error_type == "int_parsing":
        return f"El campo '{field}' debe ser un número entero"
    if error_type == "greater_than":
        return f"El campo '{field}' debe ser mayor a 0"
    if error_type == "greater_than_equal":
        return f"El campo '{field}' debe ser mayor o igual a 0"
    if error_type in {"float_parsing", "int_parsing"}:
        return f"El campo '{field}' debe tener un valor numérico válido"
    if error_type == "value_error":
        message = str(error.get("msg", ""))
        return message.removeprefix("Value error, ")
    return "Los datos enviados no son válidos"


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    messages = [validation_message(error) for error in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": messages})


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(orders.router)
