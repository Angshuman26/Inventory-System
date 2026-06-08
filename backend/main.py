from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse  
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db, Base

# 1. Initialize FastAPI app
app = FastAPI(title="Inventory & Order Management API")

# 2. Create database tables immediately upon app initialization
# This ensures that whenever the container starts, the schema exists.
Base.metadata.create_all(bind=engine)

# 3. Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")

# ==========================================
# PRODUCT ENDPOINTS
# ==========================================

@app.post("/products", response_model=schemas.ProductResponse, status_code=201)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if db_product:
        raise HTTPException(status_code=400, detail="SKU already registered")
    
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get("/products", response_model=List[schemas.ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.get("/products/{id}", response_model=schemas.ProductResponse)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{id}", response_model=schemas.ProductResponse)
def update_product(id: int, updated_product: schemas.ProductCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in updated_product.model_dump().items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    return product

@app.delete("/products/{id}", status_code=204)
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return None

# ==========================================
# CUSTOMER ENDPOINTS
# ==========================================

@app.post("/customers", response_model=schemas.CustomerResponse, status_code=201)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if db_customer:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@app.get("/customers", response_model=List[schemas.CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()

@app.get("/customers/{id}", response_model=schemas.CustomerResponse)
def get_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@app.delete("/customers/{id}", status_code=204)
def delete_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return None

# ==========================================
# ORDER ENDPOINTS
# ==========================================

@app.post("/orders", response_model=schemas.OrderResponse, status_code=201)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    total_amount = 0.0
    processed_items = []

    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {product.name}. Available: {product.stock_quantity}"
            )
        
        product.stock_quantity -= item.quantity
        unit_price = product.price
        total_amount += unit_price * item.quantity
        
        processed_items.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "unit_price": unit_price
        })

    new_order = models.Order(customer_id=order_data.customer_id, total_amount=total_amount)
    db.add(new_order)
    db.flush() 

    for p_item in processed_items:
        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=p_item["product_id"],
            quantity=p_item["quantity"],
            unit_price=p_item["unit_price"]
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/orders", response_model=List[schemas.OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()

@app.get("/orders/{id}", response_model=schemas.OrderResponse)
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.delete("/orders/{id}", status_code=204)
def delete_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.stock_quantity += item.quantity
            
    db.query(models.OrderItem).filter(models.OrderItem.order_id == id).delete()
    db.delete(order)
    db.commit()
    return None