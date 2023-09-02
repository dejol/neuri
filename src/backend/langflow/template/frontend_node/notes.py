from langflow.template.field.base import TemplateField
from langflow.template.frontend_node.base import FrontendNode
from langflow.template.template.base import Template


class NoteFrontendNode(FrontendNode):
    name: str = "Note"
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
    

class NoteEndFrontendNode(FrontendNode):
    name: str = "NoteEnd"
    template: Template = Template(
        type_name="Note",
        fields=[
            TemplateField(
                field_type="str",
                required=True,
                placeholder="",
                is_list=False,
                fulline=False,
                multiline=False,
                chat_view=True,
                show=True,
                value="...",
                name="note",
                advanced=False,
            ),
            TemplateField(
                name="AI",
                field_type="BaseLanguageModel",
                required=True,
                is_list=False,
                show=True,
                multiline=True,
                advanced=False,
            ),
        ],
    )
    description: str = ""
    base_classes: list[str] = ["LLMChain"]
    
    def to_dict(self):
        return super().to_dict()    
