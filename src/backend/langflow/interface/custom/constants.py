from langchain import PromptTemplate
from langchain.chains.base import Chain
from langchain.document_loaders.base import BaseLoader
from langchain.embeddings.base import Embeddings
from langchain.llms.base import BaseLLM
from langchain.schema import BaseRetriever, Document
from langchain.text_splitter import TextSplitter
from langchain.tools import Tool
from langchain.vectorstores.base import VectorStore
from langchain.schema import BaseOutputParser


LANGCHAIN_BASE_TYPES = {
    "Chain": Chain,
    "Tool": Tool,
    "BaseLLM": BaseLLM,
    "PromptTemplate": PromptTemplate,
    "BaseLoader": BaseLoader,
    "Document": Document,
    "TextSplitter": TextSplitter,
    "VectorStore": VectorStore,
    "Embeddings": Embeddings,
    "BaseRetriever": BaseRetriever,
    "BaseOutputParser": BaseOutputParser,
}

# Langchain base types plus Python base types
CUSTOM_COMPONENT_SUPPORTED_TYPES = {
    **LANGCHAIN_BASE_TYPES,
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "list": list,
    "dict": dict,
}


DEFAULT_CUSTOM_COMPONENT_CODE = """from langflow import CustomComponent

from langchain.llms.base import BaseLLM
from langchain.chains import LLMChain
from langchain import PromptTemplate
from langchain.schema import Document

import requests

class YourComponent(CustomComponent):
    display_name: str = "Custom Component"
    description: str = "Create any custom component you want!"

    def build_config(self):
        return { "url": { "multiline": True, "required": True } }

    def build(self, url: str, llm: BaseLLM, prompt: PromptTemplate) -> Document:
        response = requests.get(url)
        chain = LLMChain(llm=llm, prompt=prompt)
        result = chain.run(response.text[:300])
        return Document(page_content=str(result))
"""
TRANSLATER_CUSTOM_COMPONENT_CODE="""from langflow import CustomComponent

from langchain.llms.base import BaseLLM
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.chat_models import ChatOpenAI

import requests

class YourComponent(CustomComponent):
    display_name: str = "翻译模版"
    description: str = "统一翻译成英文"
    beta:bool=False
    def build_config(self):
        return { 
            "content": { "required": True },
            "code":{"show":False},
        }

    def build(self, content:Document ) -> LLMChain:
        # if content and isinstance(content, list):
        #     content = content[0]
        # page_content = content.page_content
        prompt_template='请翻译如下内容成为英文\\n{content}'
        # print(page_content)
        llm = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo-0613",openai_api_base="https://api.chatanywhere.com.cn/v1",openai_api_key="sk-K1tkfGAv3q8CjUK7XjRyugfYxRGKYSaflMCFEWhwolB7YxgW")
        prompt=PromptTemplate(input_variables=[],output_parser=None, partial_variables={'content': content}, template=prompt_template, template_format='f-string', validate_template=True)
        chain = LLMChain(llm=llm,prompt=prompt)
        chain({'content': content})
        
        return chain
"""

ARTICLE_GENERATER_CC_CODE="""from langflow import CustomComponent

from langchain.llms.base import BaseLLM
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.chat_models import ChatOpenAI

import requests

class YourComponent(CustomComponent):
    display_name: str = "生成合规文书模块"
    description: str = "根据给定的关键字字和文书模版格式自动生成文章"
    beta:bool=False
    def build_config(self):
        return { "articleTitle": { "required": True },
                 "articleTemplate": { "required": True },
                 "keyword1": { "required": True },
                 "keyword2": { "required": True },
                 "keyword3": { "required": False },
                 "code":{"show":False}
        }

    def build(self, articleTitle:Document,keyword1:Document,keyword2:Document,keyword3:Document,articleTemplate:Document ) -> LLMChain:
        # if template and isinstance(template, list):
        #     template = template[0]
        # template = template.page_content
        # if studentInfo and isinstance(studentInfo, list):
        #     studentInfo = studentInfo[0]
        # studentInfo = studentInfo.page_content
        prompt_template='请根据下面的关键字来写出以{articleTitle}为题的文章:\\n{keyword1}\\n{keyword2}\\n{keyword3}\\n文章模版如下:\\n{articleTemplate}\\n尽可能使用专业术语'
        # print(page_content)
        params={'articleTitle': articleTitle,'keyword1':keyword1,'articleTemplate':articleTemplate,'keyword2':keyword2,'keyword3':keyword3}
        llm = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo-0613",openai_api_base="https://api.chatanywhere.com.cn/v1",openai_api_key="sk-K1tkfGAv3q8CjUK7XjRyugfYxRGKYSaflMCFEWhwolB7YxgW")
        prompt=PromptTemplate(input_variables=[],output_parser=None, partial_variables=params, template=prompt_template, template_format='f-string', validate_template=True)
        chain = LLMChain(llm=llm,prompt=prompt)
        chain(params)
        
        return chain
"""

ARTICLE_STRUCTURE_CC_CODE="""from langflow import CustomComponent

from langchain.llms.base import BaseLLM
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.chat_models import ChatOpenAI

import requests

class YourComponent(CustomComponent):
    display_name: str = "文章结构模版"
    description: str = "通读文章，并输出文章结构"
    beta:bool=False
    def build_config(self):
        return { "content": { "required": True },
            "code":{"show":False}
              }

    def build(self, content:Document ) -> LLMChain:
        # if content and isinstance(content, list):
        #     content = content[0]
        # page_content = content.page_content
        prompt_template='将如下文章内容架构生成一个模版\\n{content}'
        # print(page_content)
        llm = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo-0613",openai_api_base="https://api.chatanywhere.com.cn/v1",openai_api_key="sk-K1tkfGAv3q8CjUK7XjRyugfYxRGKYSaflMCFEWhwolB7YxgW")
        prompt=PromptTemplate(input_variables=[],output_parser=None, partial_variables={'content': content}, template=prompt_template, template_format='f-string', validate_template=True)
        chain = LLMChain(llm=llm,prompt=prompt)
        chain({'content': content})
        
        return chain
"""
VIDEO_SCRIPT_CC_CODE="""from langflow import CustomComponent

from langchain.llms.base import BaseLLM
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.chat_models import ChatOpenAI

import requests

class YourComponent(CustomComponent):
    display_name: str = "小视频脚本模版"
    description: str = "根据下面的文字材料来写出小视频广告脚本"
    beta:bool=False
    def build_config(self):
        return { "articleTemplate": { "required": True }, 
                 "content": { "required": True },
                 "keyword": { "required": False },
                #  "keyword2": { "required": False },
                 "code":{"show":False}
        }

    def build(self, keyword:Document,content:Document,articleTemplate:Document ) -> LLMChain:
        # if content and isinstance(content, list):
        #     content = content[0]
        # page_content = content.page_content
        prompt_template='请根据下面的文字材料来写出小视频广告脚本：\\n{keyword}\\n{content}\\n\\n脚本模版如下:\\n{articleTemplate}\\n\\n尽可能使用生动词语'
        params={'keyword':keyword,'articleTemplate':articleTemplate,'content':content}
        llm = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo-0613",openai_api_base="https://api.chatanywhere.com.cn/v1",openai_api_key="sk-K1tkfGAv3q8CjUK7XjRyugfYxRGKYSaflMCFEWhwolB7YxgW")
        prompt=PromptTemplate(input_variables=[],output_parser=None, partial_variables=params, template=prompt_template, template_format='f-string', validate_template=True)
        chain = LLMChain(llm=llm,prompt=prompt)
        chain(params)
        
        return chain


"""

HANDLER_CC_CODE="""from langflow import CustomComponent

from langchain.llms.base import BaseLLM
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.prompts import Prompt
from langchain.schema import Document
from langchain.chat_models import ChatOpenAI

import requests

class YourComponent(CustomComponent):
    display_name: str = "全能处理器"
    description: str = "根据您提供的Prompt,智能处理您的要求"
    beta:bool=False
    def build_config(self):
        return { "prompt": { "required": True }, 
                 "code":{"show":False}
        }

    def build(self, prompt:PromptTemplate ) -> LLMChain:
        # params={'keyword1':keyword1,'articleTemplate':articleTemplate,'keyword2':keyword2,'content':content}
        llm = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo-0613",openai_api_base="https://api.chatanywhere.com.cn/v1",openai_api_key="sk-K1tkfGAv3q8CjUK7XjRyugfYxRGKYSaflMCFEWhwolB7YxgW")
        # prompt=PromptTemplate(input_variables=[],output_parser=None, partial_variables=params, template=prompt_template, template_format='f-string', validate_template=True)
        chain = LLMChain(llm=llm,prompt=prompt)
        chain(prompt.partial_variables)
        
        return chain


"""