from sqlalchemy import Column, String, ForeignKey, Date, CheckConstraint, Integer
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from .base import Base

class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    report_id = Column(String, primary_key=True)
    report_type = Column(String, CheckConstraint("report_type IN ('admin_mine', 'admin_aggregate', 'industry')"))
    mine_id = Column(String, ForeignKey("mines.mine_id"), nullable=True)
    period_start = Column(Date)
    period_end = Column(Date)
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    generated_at = Column(TIMESTAMP(timezone=True))
    file_path = Column(String)
    content_hash = Column(String)
    status = Column(String)

class ComplianceStandard(Base):
    __tablename__ = "compliance_standards"

    standard_code = Column(String, primary_key=True)
    description = Column(String)

class SdgMapping(Base):
    __tablename__ = "sdg_mappings"

    sdg_number = Column(Integer, primary_key=True)
    title = Column(String)
    relevance_notes = Column(String)

class MineComplianceStatus(Base):
    __tablename__ = "mine_compliance_status"

    mine_id = Column(String, ForeignKey("mines.mine_id"), primary_key=True)
    standard_code = Column(String, ForeignKey("compliance_standards.standard_code"), primary_key=True)
    status = Column(String)
    last_audit_date = Column(Date)
