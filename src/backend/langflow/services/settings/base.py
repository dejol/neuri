import contextlib
import json
import os
from typing import Optional, List
from pathlib import Path

import yaml
from pydantic import BaseSettings, root_validator, validator
from langflow.utils.logger import logger

BASE_COMPONENTS_PATH = str(Path(__file__).parent / "components")


class Settings(BaseSettings):
    CHAINS: dict = {}
    AGENTS: dict = {}
    PROMPTS: dict = {}
    LLMS: dict = {}
    TOOLS: dict = {}
    MEMORIES: dict = {}
    EMBEDDINGS: dict = {}
    VECTORSTORES: dict = {}
    DOCUMENTLOADERS: dict = {}
    WRAPPERS: dict = {}
    RETRIEVERS: dict = {}
    TOOLKITS: dict = {}
    TEXTSPLITTERS: dict = {}
    UTILITIES: dict = {}
    OUTPUT_PARSERS: dict = {}
    CUSTOM_COMPONENTS: dict = {}
    NOTES:dict={}

    # Define the default LANGFLOW_DIR
    CONFIG_DIR: Optional[str] = None

    DEV: bool = False
    DATABASE_URL: Optional[str] = None
    CACHE: str = "InMemoryCache"
    REMOVE_API_KEYS: bool = False
    COMPONENTS_PATH: List[str] = []

    @validator("CONFIG_DIR", pre=True, allow_reuse=True)
    def set_langflow_dir(cls, value):
        if not value:
            from platformdirs import user_cache_dir

            # Define the app name and author
            app_name = "neuri"
            app_author = "king"

            # Get the cache directory for the application
            cache_dir = user_cache_dir(app_name, app_author)

            # Create a .langflow directory inside the cache directory
            value = Path(cache_dir)
            value.mkdir(parents=True, exist_ok=True)

        if isinstance(value, str):
            value = Path(value)
        if not value.exists():
            value.mkdir(parents=True, exist_ok=True)

        return str(value)
    
    @validator("DATABASE_URL", pre=True)
    def set_database_url(cls, value):
        if not value:
            logger.debug(
                "No database_url provided, trying LANGFLOW_DATABASE_URL env variable"
            )
            if langflow_database_url := os.getenv("LANGFLOW_DATABASE_URL"):
                value = langflow_database_url
                logger.debug("Using LANGFLOW_DATABASE_URL env variable.")
            else:
                logger.debug("No DATABASE_URL env variable, using sqlite database")
                value = "sqlite:///./neuri.db"

        return value

    @validator("COMPONENTS_PATH", pre=True)
    def set_components_path(cls, value):
        if os.getenv("LANGFLOW_COMPONENTS_PATH"):
            logger.debug("Adding LANGFLOW_COMPONENTS_PATH to components_path")
            langflow_component_path = os.getenv("LANGFLOW_COMPONENTS_PATH")
            if (
                Path(langflow_component_path).exists()
                and langflow_component_path not in value
            ):
                if isinstance(langflow_component_path, list):
                    for path in langflow_component_path:
                        if path not in value:
                            value.append(path)
                    logger.debug(
                        f"Extending {langflow_component_path} to components_path"
                    )
                elif langflow_component_path not in value:
                    value.append(langflow_component_path)
                    logger.debug(
                        f"Appending {langflow_component_path} to components_path"
                    )

        if not value:
            value = [BASE_COMPONENTS_PATH]
            logger.debug("Setting default components path to components_path")
        elif BASE_COMPONENTS_PATH not in value:
            value.append(BASE_COMPONENTS_PATH)
            logger.debug("Adding default components path to components_path")

        logger.debug(f"Components path: {value}")
        return value

    class Config:
        validate_assignment = True
        extra = "ignore"
        env_prefix = "LANGFLOW_"

    @root_validator(allow_reuse=True)
    def validate_lists(cls, values):
        for key, value in values.items():
            if key != "dev" and not value:
                values[key] = []
        return values

    def update_from_yaml(self, file_path: str, dev: bool = False):
        new_settings = load_settings_from_yaml(file_path)
        self.CHAINS = new_settings.CHAINS or {}
        self.AGENTS = new_settings.AGENTS or {}
        self.PROMPTS = new_settings.PROMPTS or {}
        self.LLMS = new_settings.LLMS or {}
        self.TOOLS = new_settings.TOOLS or {}
        self.MEMORIES = new_settings.MEMORIES or {}
        self.WRAPPERS = new_settings.WRAPPERS or {}
        self.TOOLKITS = new_settings.TOOLKITS or {}
        self.TEXTSPLITTERS = new_settings.TEXTSPLITTERS or {}
        self.UTILITIES = new_settings.UTILITIES or {}
        self.EMBEDDINGS = new_settings.EMBEDDINGS or {}
        self.VECTORSTORES = new_settings.VECTORSTORES or {}
        self.DOCUMENTLOADERS = new_settings.DOCUMENTLOADERS or {}
        self.RETRIEVERS = new_settings.RETRIEVERS or {}
        self.OUTPUT_PARSERS = new_settings.OUTPUT_PARSERS or {}
        self.CUSTOM_COMPONENTS = new_settings.CUSTOM_COMPONENTS or {}
        self.COMPONENTS_PATH = new_settings.COMPONENTS_PATH or []
        self.NOTES=new_settings.NOTES or {}
        self.DEV = dev

    def update_settings(self, **kwargs):
        logger.debug("Updating settings")
        for key, value in kwargs.items():
            # value may contain sensitive information, so we don't want to log it
            if not hasattr(self, key):
                logger.debug(f"Key {key} not found in settings")
                continue
            logger.debug(f"Updating {key}")
            if isinstance(getattr(self, key), list):
                # value might be a '[something]' string
                with contextlib.suppress(json.decoder.JSONDecodeError):
                    value = json.loads(str(value))
                if isinstance(value, list):
                    for item in value:
                        if item not in getattr(self, key):
                            getattr(self, key).append(item)
                    logger.debug(f"Extended {key}")
                else:
                    getattr(self, key).append(value)
                    logger.debug(f"Appended {key}")

            else:
                setattr(self, key, value)
                logger.debug(f"Updated {key}")
            logger.debug(f"{key}: {getattr(self, key)}")


def save_settings_to_yaml(settings: Settings, file_path: str):
    with open(file_path, "w") as f:
        settings_dict = settings.dict()
        yaml.dump(settings_dict, f)


def load_settings_from_yaml(file_path: str) -> Settings:
    # Check if a string is a valid path or a file name
    if "/" not in file_path:
        # Get current path
        current_path = os.path.dirname(os.path.abspath(__file__))

        file_path = os.path.join(current_path, file_path)

    with open(file_path, "r") as f:
        settings_dict = yaml.safe_load(f)
        settings_dict = {k.upper(): v for k, v in settings_dict.items()}

        for key in settings_dict:
            if key not in Settings.__fields__.keys():
                raise KeyError(f"Key {key} not found in settings")
            logger.debug(f"Loading {len(settings_dict[key])} {key} from {file_path}")

    return Settings(**settings_dict)
