from sqlalchemy import Column, String, Numeric, ForeignKey, Date, CheckConstraint, Boolean, Integer, Index
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base

class ProductionRecord(Base):
    __tablename__ = "production_records"

    record_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    period = Column(Date)
    actual_tonnage = Column(Numeric)
    target_tonnage = Column(Numeric)
    forecast_tonnage = Column(Numeric)
    model_version = Column(String)
    source = Column(String, CheckConstraint("source IN ('ibm_msmp', 'mcdr_report', 'model_forecast')"))
    is_synthetic = Column(Boolean, nullable=False, default=False)

Index("idx_production_records_mine_period", ProductionRecord.mine_id, ProductionRecord.period)

class ShortfallEvent(Base):
    __tablename__ = "shortfall_events"

    shortfall_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    period = Column(Date)
    target_tonnage = Column(Numeric)
    forecast_or_actual_tonnage = Column(Numeric)
    gap_tonnage = Column(Numeric)
    gap_pct = Column(Numeric)
    risk_level = Column(String, CheckConstraint("risk_level IN ('low', 'moderate', 'severe')"))
    is_real_anchor = Column(Boolean, nullable=False, default=False)

Index("idx_shortfall_events_mine_period", ShortfallEvent.mine_id, ShortfallEvent.period)

class CauseAnalysis(Base):
    __tablename__ = "cause_analysis"

    analysis_id = Column(String, primary_key=True)
    shortfall_id = Column(String, ForeignKey("shortfall_events.shortfall_id"))
    feature_name = Column(String)
    shap_value = Column(Numeric)
    rank = Column(Integer)

class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    action_id = Column(String, primary_key=True)
    shortfall_id = Column(String, ForeignKey("shortfall_events.shortfall_id"))
    action_type = Column(String)
    recommended_change = Column(JSONB)
    expected_gap_closure_tonnage = Column(Numeric)
    feasibility_rank = Column(Integer)
    status = Column(String, CheckConstraint("status IN ('pending', 'actioned', 'resolved')"))

class ValueForecast(Base):
    __tablename__ = "value_forecast"

    forecast_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    period = Column(Date)
    grade_band = Column(String)
    forecast_tonnage = Column(Numeric)
    ex_mine_price_per_tonne = Column(Numeric)
    forecast_revenue = Column(Numeric)

Index("idx_value_forecast_mine_period", ValueForecast.mine_id, ValueForecast.period)

class PriceTier(Base):
    __tablename__ = "price_tiers"

    tier_id = Column(String, primary_key=True)
    mine_id = Column(String, ForeignKey("mines.mine_id"), index=True)
    grade_band = Column(String)
    price_per_tonne = Column(Numeric)
    effective_date = Column(Date)
