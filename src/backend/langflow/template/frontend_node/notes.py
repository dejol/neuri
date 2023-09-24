from langflow.template.field.base import TemplateField
from langflow.template.frontend_node.base import FrontendNode
from langflow.template.template.base import Template
from langchain.llms.base import BaseLLM

class NoteFrontendNode(FrontendNode):
    name: str = "Note"
    runnable:bool = False
    template: Template = Template(
        type_name="Note",
        fields=[
            TemplateField(
                field_type="str",
                required=True,
                placeholder="",
                is_list=False,
                fulline=True,
                show=True,
                value="",
                name="note",
                advanced=False,
            )
        ],
    )
    description: str = ""
    base_classes: list[str] = ["Document"]
    
    def to_dict(self):
        return super().to_dict()
    

class AINoteFrontendNode(FrontendNode):
    name: str = "AINote"
    runnable: bool = True
    template: Template = Template(
        type_name="Note",
        fields=[
            TemplateField(
                field_type="str",
                required=True,
                placeholder="Type something...",
                is_list=False,
                fulline=False,
                multiline=False,
                chat_view=True,
                show=True,
                value="",
                name="note",
                advanced=False,
            ),
            TemplateField(
                name="source",
                field_type="Document",
                required=True,
                is_list=False,
                show=True,
                multiline=True,
                advanced=False,
            ),
        ],
    )
    description: str = ""
    base_classes: list[str] = ["BaseLLM"]
    
    def to_dict(self):
        return super().to_dict()    

class CustomPromptFrontendNode(FrontendNode):
    name: str = "CustomPrompt"
    runnable:bool = True
    template: Template = Template(
        type_name="Prompt",
        fields=[
            TemplateField(
                field_type="prompt",
                required=True,
                is_list=False,
                fulline=False,
                show=True,
                value="",
                name="template",
                advanced=False,
            )
        ],
    )
    description: str = "输入你的Prompt"
    base_classes: list[str] = ["PromptTemplate"]
    
    def to_dict(self):
        return super().to_dict()