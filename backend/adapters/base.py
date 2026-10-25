"""
ScoutIQ — Data Source Adapter Interface (Section 4.1)
Defines standard contracts for external APIs, CSV datasets, and synthetic simulation engines.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class IngestionResult(BaseModel):
    source: str
    records_ingested: int
    data_quality_flag: str = "VALID"
    patch_version: str = "current"
    details: Dict[str, Any] = {}


class DataSourceAdapter(ABC):
    """Abstract base class for all data source adapters."""

    @abstractmethod
    def get_source_name(self) -> str:
        """Returns the canonical name of the data source."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the required credentials / environment variables are set."""
        pass

    @abstractmethod
    def fetch_data(self, **kwargs) -> List[Dict[str, Any]]:
        """Fetches raw match or player records from the source."""
        pass

    @abstractmethod
    def ingest(self, conn, **kwargs) -> IngestionResult:
        """Ingests records into the database with quality flags and timestamps."""
        pass
