from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class UserPortfolio(SQLModel, table=True):
    """Portefeuille personnel (une seule ligne : MarketAI tourne en local, sans comptes)."""
    id: Optional[int] = Field(default=None, primary_key=True)
    risk_profile: str   # "conservateur" | "equilibre" | "croissance" | "agressif"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    positions: str = "[]"    # JSON string
    history: str = "[]"      # JSON string
    initial_capital: float = 10000.0
