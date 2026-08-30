from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Generic, TypeVar

T = TypeVar("T")

class ResponseMeta(BaseModel):
    model_version: str
    computed_at: str

class ErrorResponse(BaseModel):
    code: str
    message: str

class Envelope(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    meta: Optional[ResponseMeta] = None
    error: Optional[ErrorResponse] = None

# --- Workspace Schemas ---

class MineInfo(BaseModel):
    id: str
    name: str
    location: str
    district: str
    state: str
    type: str
    leaseId: str
    status: str
    dgmsStatus: str
    ibmRegistration: str

class OperationalSummary(BaseModel):
    headline: str
    riskState: str # 'LOW' | 'MEDIUM' | 'HIGH'
    dynamicStatement: str
    coreValueMessage: str
    complianceStandard: str
    lastUpdated: str

class OreGradeBreakdown(BaseModel):
    highGradeMn: float
    mediumGradeMn: float
    lowGradeMn: float

class MonthlyTrend(BaseModel):
    month: str
    actual: Optional[float]
    target: float
    forecast: float
    lowerBound: float
    upperBound: float

class Production(BaseModel):
    actual: float
    target: float
    forecast: float
    gap: float
    unit: str
    isSynthetic: bool
    oreGradeBreakdown: OreGradeBreakdown
    monthlyTrend: List[MonthlyTrend]

class ShortfallRisk(BaseModel):
    probability: float
    expectedProduction: float
    target: float
    expectedGap: float
    riskLevel: str

class AccessibleOre(BaseModel):
    geologicalPotential: float
    accessiblePotential: float
    operationallyRecoverable: float
    estimatedVolumeTons: float

class GisZoneCoords(BaseModel):
    x: float
    y: float
    width: float
    height: float

class GisZone(BaseModel):
    id: str
    name: str
    prospectivityScore: str # 'High' | 'Medium' | 'Low'
    geologicalPotential: float
    accessiblePotential: float
    recoverablePotential: float
    estimatedContributionTons: float
    mnGradePct: str
    coords: GisZoneCoords

class ModelInput(BaseModel):
    category: str
    label: str
    status: str
    source: str

class RiskContributor(BaseModel):
    factor: str
    importancePct: float
    description: str
    mitigationStrategy: str

class FutureSourceZone(BaseModel):
    id: str
    name: str
    prospectivity: str
    estimatedPotentialContributionTons: float
    description: str

class RecommendationParams(BaseModel):
    equipmentAvailability: str
    blastingDelay: str
    expectedGap: str

class Recommendation(BaseModel):
    instruction: str
    currentParams: RecommendationParams
    recommendedParams: RecommendationParams

class Alert(BaseModel):
    id: str
    priority: str
    title: str
    mine: str
    triggeredCondition: str
    affectedZone: str
    timestamp: str

class MineWorkspaceData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mineInfo: MineInfo
    operationalSummary: OperationalSummary
    production: Production
    shortfallRisk: ShortfallRisk
    accessibleOre: AccessibleOre
    gisZones: List[GisZone]
    modelInputs: List[ModelInput]
    riskContributors: List[RiskContributor]
    futureSourceZone: FutureSourceZone
    recommendation: Recommendation
    alerts: List[Alert]
