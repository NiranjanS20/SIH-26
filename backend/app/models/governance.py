from sqlalchemy import Column, String, Numeric, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from .base import Base

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    model_name = Column(String, primary_key=True)
    version = Column(String, primary_key=True)
    cv_metric_value = Column(Numeric)
    trained_at = Column(TIMESTAMP(timezone=True))
    artifact_path = Column(String)
    is_canonical = Column(Boolean)

class AuditLog(Base):
    __tablename__ = "audit_log"

    log_id = Column(String, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    action = Column(String)
    endpoint = Column(String)
    timestamp = Column(TIMESTAMP(timezone=True))
    prev_hash = Column(String)
    curr_hash = Column(String)
