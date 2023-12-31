from langflow.interface.agents.base import agent_creator
from langflow.interface.chains.base import chain_creator
from langflow.interface.document_loaders.base import documentloader_creator
from langflow.interface.embeddings.base import embedding_creator
from langflow.interface.llms.base import llm_creator
from langflow.interface.memories.base import memory_creator
from langflow.interface.prompts.base import prompt_creator
from langflow.interface.text_splitters.base import textsplitter_creator
from langflow.interface.toolkits.base import toolkits_creator
from langflow.interface.tools.base import tool_creator
from langflow.interface.utilities.base import utility_creator
from langflow.interface.vector_store.base import vectorstore_creator
from langflow.interface.wrappers.base import wrapper_creator
from langflow.interface.output_parsers.base import output_parser_creator
from langflow.interface.retrievers.base import retriever_creator
from langflow.interface.custom.base import custom_component_creator
from langflow.interface.notes.base import notes_creator
from langflow.utils.lazy_load import LazyLoadDictBase


class AllTypesDict(LazyLoadDictBase):
    def __init__(self):
        self._all_types_dict = None

    @property
    def ALL_TYPES_DICT(self):
        return self.all_types_dict

    def _build_dict(self):
        langchain_types_dict = self.get_type_dict()
        return {
            **langchain_types_dict,
            "Custom": ["Custom Tool", "Python Function"],
        }

    def get_type_dict(self):
        return {
            "agents": agent_creator.to_list(),
            "prompts": prompt_creator.to_list(),
            "llms": llm_creator.to_list(),
            "tools": tool_creator.to_list(),
            "chains": chain_creator.to_list(),
            "memory": memory_creator.to_list(),
            "toolkits": toolkits_creator.to_list(),
            "wrappers": wrapper_creator.to_list(),
            "documentLoaders": documentloader_creator.to_list(),
            "vectorStore": vectorstore_creator.to_list(),
            "embeddings": embedding_creator.to_list(),
            "textSplitters": textsplitter_creator.to_list(),
            "utilities": utility_creator.to_list(),
            "outputParsers": output_parser_creator.to_list(),
            "retrievers": retriever_creator.to_list(),
            "custom_components": custom_component_creator.to_list(),
            "notes":notes_creator.to_list(),
        }


lazy_load_dict = AllTypesDict()
