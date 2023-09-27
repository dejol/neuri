from langflow.template.field.base import TemplateField
from langflow.template.frontend_node.base import FrontendNode
from langflow.template.template.base import Template
from langflow.interface.custom.constants import DEFAULT_CUSTOM_COMPONENT_CODE
from langflow.interface.custom.constants import TRANSLATER_CUSTOM_COMPONENT_CODE,ARTICLE_GENERATER_CC_CODE,ARTICLE_STRUCTURE_CC_CODE,VIDEO_SCRIPT_CC_CODE,HANDLER_CC_CODE


class CustomComponentFrontendNode(FrontendNode):
    name: str = "CustomComponent"
    display_name: str = "Custom Component"
    beta: bool = True
    template: Template = Template(
        type_name="CustomComponent",
        fields=[
            TemplateField(
                field_type="code",
                required=True,
                placeholder="",
                is_list=False,
                show=True,
                value=DEFAULT_CUSTOM_COMPONENT_CODE,
                name="code",
                advanced=False,
                dynamic=True,
            )
        ],
    )
    description: str = "Create any custom component you want!"
    base_classes: list[str] = []

    def to_dict(self):
        return super().to_dict()
    
class TranslaterFrontendNode(FrontendNode):
    name: str = "TranslaterComponent"
    display_name: str = "英文翻译器"
    beta: bool = False
    template: Template = Template(
        type_name="TranslaterComponent",
        fields=[
            TemplateField(
                field_type="code",
                required=True,
                placeholder="",
                is_list=False,
                show=False,
                value=TRANSLATER_CUSTOM_COMPONENT_CODE,
                name="code",
                advanced=False,
                dynamic=True,
            )
        ],
    )
    description: str = "translate what you want to English!"
    base_classes: list[str] = []

    def to_dict(self):
        return super().to_dict()    

class ArticleGeneraterFrontendNode(FrontendNode):
    name: str = "ArticleGeneraterComponent"
    display_name: str = "文案生成器"
    beta: bool = False
    template: Template = Template(
        type_name="ArticleGeneraterComponent",
        fields=[
            TemplateField(
                field_type="code",
                required=True,
                placeholder="",
                is_list=False,
                show=False,
                value=ARTICLE_GENERATER_CC_CODE,
                name="code",
                advanced=False,
                dynamic=True,
            )
        ],
    )
    description: str = "generate what you want!"
    base_classes: list[str] = []

    def to_dict(self):
        return super().to_dict()    
    
class ArticleStructureFrontendNode(FrontendNode):
    name: str = "ArticleStructureComponent"
    display_name: str = "文章结构生成器"
    beta: bool = False
    template: Template = Template(
        type_name="ArticleStructureComponent",
        fields=[
            TemplateField(
                field_type="code",
                required=True,
                placeholder="",
                is_list=False,
                show=False,
                value=ARTICLE_STRUCTURE_CC_CODE,
                name="code",
                advanced=False,
                dynamic=True,
            )
        ],
    )
    description: str = " what you want!"
    base_classes: list[str] = []

    def to_dict(self):
        return super().to_dict()  

class VideoScriptFrontendNode(FrontendNode):
    name: str = "VideoScriptComponent"
    display_name: str = "小视频脚本生成器"
    beta: bool = False
    template: Template = Template(
        type_name="VideoScriptComponent",
        fields=[
            TemplateField(
                field_type="code",
                required=True,
                placeholder="",
                is_list=False,
                show=False,
                value=VIDEO_SCRIPT_CC_CODE,
                name="code",
                advanced=False,
                dynamic=True,
            )
        ],
    )
    description: str = " what you want!"
    base_classes: list[str] = []

    def to_dict(self):
        return super().to_dict()      
    
class HandlerFrontendNode(FrontendNode):
    name: str = "HandlerComponent"
    display_name: str = "全能处理器"
    beta: bool = False
    template: Template = Template(
        type_name="HandlerComponent",
        fields=[
            TemplateField(
                field_type="code",
                required=True,
                placeholder="",
                is_list=False,
                show=False,
                value=HANDLER_CC_CODE,
                name="code",
                advanced=False,
                dynamic=True,
            )
        ],
    )
    description: str = " what you want!"
    base_classes: list[str] = []

    def to_dict(self):
        return super().to_dict()     