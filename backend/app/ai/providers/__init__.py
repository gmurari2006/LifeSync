from abc import ABC, abstractmethod
from typing import Dict, Any


class AIProvider(ABC):
    """
    Abstract base interface for LifeSync AI structuring providers.
    Allows local rule-based models, mock providers, and future external LLM services
    to be swapped without modifying core business services.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the provider (e.g., 'local-nlp', 'gemini', 'mock')."""
        pass

    @property
    @abstractmethod
    def model_version(self) -> str:
        """Model or engine version string."""
        pass

    @abstractmethod
    async def structure_emergency_report(
        self,
        report_data: Dict[str, Any],
        case_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Takes raw citizen report dictionary and context, returns structured dictionary.
        """
        pass
