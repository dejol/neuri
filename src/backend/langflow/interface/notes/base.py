from typing import Dict, List, Optional, Type

from langchain import SQLDatabase, utilities
from langchain.schema import Document
from langflow.custom.customs import get_custom_nodes
from langflow.interface.base import LangChainTypeCreator
from langflow.interface.importing.utils import import_class
from langflow.services.utils import get_settings_manager

from langflow.template.frontend_node.notes import NoteFrontendNode
from langflow.utils.logger import logger
from langflow.utils.util import build_template_from_class

from langflow.interface.tools.custom import Function
from pydantic import BaseModel

class NotesCreator(LangChainTypeCreator):
    type_name: str = "notes"

    @property
    def frontend_node_class(self) -> Type[NoteFrontendNode]:
        return NoteFrontendNode

    @property
    def type_to_loader_dict(self) -> Dict:
        if self.type_dict is None:
            self.type_dict: dict[str, Any] = {
                "Note": Note,
            }
        return self.type_dict
    

    def get_signature(self, name: str) -> Optional[Dict]:
        """Get the signature of a utility."""
        try:
            custom_nodes = get_custom_nodes(self.type_name)

            if name in custom_nodes.keys():
                # logger.debug("return 1:"+name)
                return custom_nodes[name]
            # logger.debug("return 2:"+name)
            return build_template_from_class(name, self.type_to_loader_dict)
        except ValueError as exc:
            raise ValueError(f"Note {name} not found") from exc

        except AttributeError as exc:
            logger.error(f"Note {name} not loaded: {exc}")
            return None

    def to_list(self) -> List[str]:
        return list(self.type_to_loader_dict.keys())


notes_creator = NotesCreator()


class Note(Function):
     code: str

class AINote(BaseModel):
     code: str
