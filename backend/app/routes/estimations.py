from fastapi import APIRouter

router = APIRouter()

@router.get("/categories")
def get_categories():
    return [
        {
            "id": 1,
            "name": "Textiles",
            "product_types": ["Jeans", "T-Shirt", "Jacket", "Dress", "Sweater", "Shoes"]
        },
        {
            "id": 2,
            "name": "Electronics",
            "product_types": ["Smartphone", "Tablet", "Laptop", "Hair dryer"]
        }
    ]