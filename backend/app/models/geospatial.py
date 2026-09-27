from sqlalchemy import Column, String, Numeric, ForeignKey, Date, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import TIMESTAMP
from geoalchemy2 import Geometry
from .base import Base

class GeochemSample(Base):
    __tablename__ = "geochem_samples"

    sample_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    geom = Column(Geometry('POINT', srid=4326))
    mno_pct = Column(Numeric)
    fe2o3_pct = Column(Numeric)
    sample_date = Column(Date)
    source = Column(String)

Index("idx_geochem_samples_geom", GeochemSample.geom, postgresql_using="gist")

class GradePolygon(Base):
    __tablename__ = "grade_polygons"

    polygon_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    geom = Column(Geometry('POLYGON', srid=4326))
    grade_band = Column(String)
    avg_mno_pct = Column(Numeric)

Index("idx_grade_polygons_geom", GradePolygon.geom, postgresql_using="gist")

class ProspectivityZone(Base):
    __tablename__ = "prospectivity_zones"

    zone_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    geom = Column(Geometry('POLYGON', srid=4326))
    geological_potential_score = Column(Numeric)
    accessible_ore_score = Column(Numeric)
    recoverable_ore_score = Column(Numeric)
    model_version = Column(String)
    computed_at = Column(TIMESTAMP(timezone=True))

Index("idx_prospectivity_zones_geom", ProspectivityZone.geom, postgresql_using="gist")

class RasterLayer(Base):
    __tablename__ = "raster_layers"

    layer_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), nullable=True, index=True)
    layer_type = Column(String, CheckConstraint("layer_type IN ('ndvi', 'lst', 'slope', 'elevation', 'soil_moisture', 'iron_oxide', 'clay', 'rainfall_5km')"))
    season = Column(String)
    resolution_m = Column(Numeric)
    file_path = Column(String)
    bbox = Column(Geometry('POLYGON', srid=4326))
    crs = Column(String)
    acquisition_date = Column(Date)
