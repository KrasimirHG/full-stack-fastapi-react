import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Order, OrderCreate, OrderPublic, OrdersPublic, Item, User, Message

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=OrdersPublic)
def read_orders(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve orders.
    """
    statement = (
        select(Order, Item.title, Item.description, User.full_name)
        .join(Item, Order.item_id == Item.id)
        .join(User, Order.owner_id == User.id)
        .offset(skip)
        .limit(limit)
    )

    if not current_user.is_superuser:
        statement = statement.where(Order.owner_id == current_user.id)

    orders = session.exec(statement).all()

    # Convert list of tuples into a list of OrderPublic objects
    orders_public = [
        OrderPublic(
            id=o.id,
            quantity=o.quantity,
            item_id=o.item_id,
            item_title=title,
            item_description=desc,
            user_name=user,
            created_on=o.created_on,
            updated_on=o.updated_on,
        )
        for o, title, desc, user in orders
    ]

    return OrdersPublic(data=orders_public)


@router.get("/all", response_model=OrdersPublic)
def read_all_orders(
    session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Retrieve all orders.
    """
    statement = (
        select(Order, Item.title, Item.description, User.full_name)
        .join(Item, Order.item_id == Item.id)
        .join(User, Order.owner_id == User.id)
    )

    if not current_user.is_superuser:
        statement = statement.where(Order.owner_id == current_user.id)

    orders = session.exec(statement).all()

    # Convert list of tuples into a list of OrderPublic objects
    orders_public = [
        OrderPublic(
            id=o.id,
            quantity=o.quantity,
            item_id=o.item_id,
            item_title=title,
            item_description=desc,
            user_name=user,
            created_on=o.created_on,
            updated_on=o.updated_on,
        )
        for o, title, desc, user in orders
    ]

    return OrdersPublic(data=orders_public)



@router.get("/{id}", response_model=OrderPublic)
def read_order(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get order by ID.
    """
    order = session.get(Order, id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if not current_user.is_superuser and (order.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    statement = (
            select(Order, Item.title, Item.description, User.full_name)
            .join(Item, Order.item_id == Item.id)
            .join(User, Order.owner_id == User.id)
            .where(Order.id == id)
        )
    full_order = session.exec(statement).one()

    full_order_public = OrderPublic(
        id=full_order[0].id,
        quantity=full_order[0].quantity,
        item_id=full_order[0].item_id,
        item_title=full_order[1],
        item_description=full_order[2],
        user_name=full_order[3],
        created_on=full_order[0].created_on,
        updated_on=full_order[0].updated_on,
    )

    return full_order_public


@router.post("/", response_model=Order)
def create_order(
    *, session: SessionDep, current_user: CurrentUser, order_in: OrderCreate
) -> Any:
    """
    Create new order.
    """
    order = Order.model_validate(order_in, update={"owner_id": current_user.id})
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@router.put("/{id}", response_model=Order)
def update_order(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, order_in: OrderCreate
) -> Any:
    """
    Update an order.
    """
    order = session.get(Order, id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if not current_user.is_superuser and (order.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = order_in.model_dump(exclude_unset=True)
    order.sqlmodel_update(update_dict)
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@router.delete("/{id}", response_model=Message)
def delete_order(
    *,session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an order.
    """
    order = session.get(Order, id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if not current_user.is_superuser and (order.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(order)
    session.commit()
    return Message(message="Order successfully deleted")
