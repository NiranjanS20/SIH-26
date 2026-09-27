from sqlalchemy import Column, String, Numeric, CheckConstraint, ForeignKey, text, Index
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from geoalchemy2 import Geometry
from .base import Base

class Mine(Base):
    __tablename__ = "mines"

    mine_id = Column(String, primary_key=True)
    name = Column(String)
    district = Column(String)
    state = Column(String)
    mine_type = Column(String, CheckConstraint("mine_type IN ('opencast', 'underground')"))
    centroid = Column(Geometry('POINT', srid=4326))
    boundary_geom = Column(Geometry('POLYGON', srid=4326))
    lease_area_ha = Column(Numeric)
    baseline_production_tpd = Column(Numeric)
    status = Column(String, CheckConstraint("status IN ('active', 'dormant')"))

# Explicit spatial index on boundary_geom as requested
Index("idx_mines_boundary_geom", Mine.boundary_geom, postgresql_using="gist")

class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, CheckConstraint("role IN ('admin', 'site_manager', 'industry_viewer')"), nullable=False)
    assigned_mine_id = Column(String, ForeignKey("mines.mine_id"), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
