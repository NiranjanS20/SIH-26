from sqlalchemy import Column, String, Numeric, ForeignKey, Date, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from .base import Base

class DelayReasonLookup(Base):
    __tablename__ = "delay_reason_lookup"

    reason_code = Column(String, primary_key=True)
    description = Column(String)

class Equipment(Base):
    __tablename__ = "equipment"

    equipment_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    equipment_type = Column(String, CheckConstraint("equipment_type IN ('drill', 'loader', 'conveyor_belt', 'compressor')"))
    tag = Column(String)
    status = Column(String)
    last_updated = Column(TIMESTAMP(timezone=True))

class ProductionEntry(Base):
    __tablename__ = "production_entries"

    entry_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    shift_date = Column(Date)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    actual_output_tonnage = Column(Numeric)
    target_tonnage_snapshot = Column(Numeric)
    reason_code = Column(String)
    reason_notes = Column(String)
    operating_hours = Column(Numeric)
    downtime_hours = Column(Numeric)
    submitted_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class BlastingEvent(Base):
    __tablename__ = "blasting_events"

    blast_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    production_entry_id = Column(String, ForeignKey("production_entries.entry_id"))
    planned_datetime = Column(TIMESTAMP(timezone=True))
    actual_datetime = Column(TIMESTAMP(timezone=True))
    delay_hours = Column(Numeric)
    delay_reason = Column(String, ForeignKey("delay_reason_lookup.reason_code"))
    notes = Column(String)
