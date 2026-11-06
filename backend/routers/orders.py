import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Order, Product
from schemas import OrderCreate, OrderItemOut, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderOut:
    quantities: dict[int, int] = {}
    for item in payload.items:
        quantities[item.product_id] = (
            quantities.get(item.product_id, 0) + item.quantity
        )

    products = db.query(Product).filter(Product.id.in_(quantities)).all()
    products_by_id = {product.id: product for product in products}

    for product_id in quantities:
        if product_id not in products_by_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El producto con id {product_id} no existe",
            )

    for product_id, quantity in quantities.items():
        product = products_by_id[product_id]
        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"No hay stock suficiente de '{product.name}'. "
                    f"Disponible: {product.stock}"
                ),
            )

    total = 0.0
    items: list[OrderItemOut] = []
    for product_id, quantity in quantities.items():
        product = products_by_id[product_id]
        product.stock -= quantity
        total += product.price * quantity
        items.append(OrderItemOut(product_id=product_id, quantity=quantity))

    order = Order(
        total=total,
        items_json=json.dumps([item.model_dump() for item in items]),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return OrderOut(
        id=order.id,
        total=order.total,
        created_at=order.created_at,
        items=items,
    )
