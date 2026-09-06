from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

# 1. Wo kann repariert werden? (Werkstätten & Repair Cafés)
class RepairLocation(Base):
    __tablename__ = "repair_locations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)          # z. B. "Repair Café Neuhausen"
    source = Column(String, nullable=False)         # "awm_muenchen" oder "reparatur_initiativen"
    street = Column(String, nullable=True)
    postal_code = Column(String, index=True, nullable=True) # z. B. "80331"
    city = Column(String, default="München")
    categories = Column(String, nullable=True)      # z. B. "Elektronik, Textilien"
    website = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 2. Was kostet eine Reparatur ungefähr? (Studienwerte)
class RepairCostBenchmark(Base):
    __tablename__ = "repair_cost_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)       # "textiles" oder "electronics"
    product_type = Column(String, nullable=False)   # "jeans", "smartphone"
    repair_type = Column(String, nullable=False)    # "zipper", "display", "battery"
    cost_min = Column(Float, nullable=False)        # z. B. 15.0
    cost_max = Column(Float, nullable=False)        # z. B. 28.0

# 3. Was spart die Reparatur an CO2 und Müll? (Studienwerte)
class ProductImpactBenchmark(Base):
    __tablename__ = "product_impact_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)       # "textiles" oder "electronics"
    product_type = Column(String, nullable=False)   # "jeans", "laptop"
    avg_weight_kg = Column(Float, nullable=False)   # Müllersparnis (z. B. 0.8 kg)
    co2e_kg = Column(Float, nullable=False)         # CO2-Ersparnis (z. B. 23.4 kg)