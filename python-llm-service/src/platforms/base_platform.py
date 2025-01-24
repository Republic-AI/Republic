from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BasePlatform(ABC):
    """Base class for all platform integrations."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the platform with configuration."""
        self.config = config
        self.validate_config()
    
    @abstractmethod
    def validate_config(self) -> None:
        """Validate the platform configuration."""
        pass
    
    @abstractmethod
    async def post(self, content: str, **kwargs) -> Dict[str, Any]:
        """Post content to the platform.
        
        Args:
            content: The content to post
            **kwargs: Additional platform-specific parameters
            
        Returns:
            Dict containing the post results
        """
        pass
    
    @abstractmethod
    async def get_updates(self, **kwargs) -> Dict[str, Any]:
        """Get updates from the platform.
        
        Args:
            **kwargs: Platform-specific parameters
            
        Returns:
            Dict containing the updates
        """
        pass
    
    @abstractmethod
    async def cleanup(self) -> None:
        """Clean up any resources used by the platform."""
        pass 