from fastapi import APIRouter, HTTPException, WebSocket, WebSocketException, status
from fastapi.responses import StreamingResponse
from langflow.api.utils import build_input_keys_response
from langflow.api.v1.schemas import BuildStatus, BuiltResponse, InitResponse, StreamData,ProcessResponse

from langflow.services import service_manager, ServiceType
from langflow.graph.graph.base import Graph
from langflow.utils.logger import logger
from cachetools import LRUCache

from langchain.llms.base import BaseLLM
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import ChatOpenAI
import os

router = APIRouter(tags=["Chat"])

flow_data_store: LRUCache = LRUCache(maxsize=10)


@router.websocket("/chat/{client_id}")
async def chat(client_id: str, websocket: WebSocket):
    """Websocket endpoint for chat."""
    try:
        chat_manager = service_manager.get(ServiceType.CHAT_MANAGER)
        if client_id in chat_manager.in_memory_cache:
            await chat_manager.handle_websocket(client_id, websocket)
        else:
            # We accept the connection but close it immediately
            # if the flow is not built yet
            await websocket.accept()
            message = "Please, build the flow before sending messages"
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason=message)
    except WebSocketException as exc:
        logger.error(f"Websocket error: {exc}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason=str(exc))


@router.post("/build/init/{flow_id}", response_model=InitResponse, status_code=201)
async def init_build(graph_data: dict, flow_id: str):
    """Initialize the build by storing graph data and returning a unique session ID."""
    # logger.debug("=====before:%s",graph_data)
    # nodes=graph_data['data']['nodes']
    # for ind, val in enumerate(nodes):
    #     node=val['data']['node']
    #     if ('runnable' in node) and not (node['runnable']):
    #         del nodes[ind]
    # logger.debug("after:%s",graph_data)
###remove not runnable node
    # logger.debug("total number_of_nodes:%s",len(graph_data['data']['nodes']))
    i=0
    newNodes=[]
    notRunnable=[] #only node id
    while i< len(graph_data['data']['nodes']):
        # logger.debug("%s:%s:%s",i,graph_data['data']['nodes'][i]['type'],"NODE_TYPE")
        if(graph_data['data']['nodes'][i]['type']!="genericNode"):
            notRunnable.append(graph_data['data']['nodes'][i]['id']) 
        else:    
            if( 'runnable' in graph_data['data']['nodes'][i]['data']['node']):
                # logger.debug("%s:%s:%s",i,graph_data['data']['nodes'][i]['data']['id'],graph_data['data']['nodes'][i]['data']['node']['runnable'])
                if(graph_data['data']['nodes'][i]['data']['node']['runnable']):
                    # del graph_data['data']['nodes'][i]
                    newNodes.append(graph_data['data']['nodes'][i])
                else:
                    notRunnable.append(graph_data['data']['nodes'][i]['data']['id'])    

            else:
                # logger.debug("%s:%s:%s",i,graph_data['data']['nodes'][i]['data']['id'],"UN")
                newNodes.append(graph_data['data']['nodes'][i])
        i+=1
    
    graph_data['data']['nodes']=newNodes      
    # logger.debug("runnable number_of_nodes:%s",len(graph_data['data']['nodes']))
#########

    # logger.debug("total number_of_edges:%s",len(graph_data['data']['edges']))
    # logger.debug("notRunnable:%s",notRunnable)
    j=0
    newEdges=[]
    while j< len(graph_data['data']['edges']):
        source=graph_data['data']['edges'][j]['source']
        target=graph_data['data']['edges'][j]['target']
        if(not(source in notRunnable ) and not(target in notRunnable )):
            # logger.debug("%s:%s:%s",j,source,target)
            newEdges.append(graph_data['data']['edges'][j])
        j+=1
    
    graph_data['data']['edges']=newEdges
    # logger.debug("runnable number_of_edges:%s",len(graph_data['data']['edges']))

    # logger.debug("runnable number_of_edges:%s",graph_data['data']['edges'])
#######

    try:
        if flow_id is None:
            raise ValueError("No ID provided")
        # Check if already building
        if (
            flow_id in flow_data_store
            and flow_data_store[flow_id]["status"] == BuildStatus.IN_PROGRESS
        ):
            return InitResponse(flowId=flow_id)

        # Delete from cache if already exists
        chat_manager = service_manager.get(ServiceType.CHAT_MANAGER)
        if flow_id in chat_manager.in_memory_cache:
            with chat_manager.in_memory_cache._lock:
                chat_manager.in_memory_cache.delete(flow_id)
                logger.debug(f"Deleted object {flow_id} from cache")
        flow_data_store[flow_id] = {
            "graph_data": graph_data,
            "status": BuildStatus.STARTED,
        }

        return InitResponse(flowId=flow_id)
    except Exception as exc:
        logger.error(f"Error initializing build: {exc}")
        return HTTPException(status_code=500, detail=str(exc))


@router.get("/build/{flow_id}/status", response_model=BuiltResponse)
async def build_status(flow_id: str):
    """Check the flow_id is in the flow_data_store."""
    try:
        built = (
            flow_id in flow_data_store
            and flow_data_store[flow_id]["status"] == BuildStatus.SUCCESS
        )

        return BuiltResponse(
            built=built,
        )

    except Exception as exc:
        logger.error(f"Error checking build status: {exc}")
        return HTTPException(status_code=500, detail=str(exc))


@router.get("/build/stream/{flow_id}", response_class=StreamingResponse)
async def stream_build(flow_id: str):
    """Stream the build process based on stored flow data."""

    async def event_stream(flow_id):
        final_response = {"end_of_stream": True}
        artifacts = {}
        try:
            if flow_id not in flow_data_store:
                error_message = "Invalid session ID"
                yield str(StreamData(event="error", data={"error": error_message}))
                return

            if flow_data_store[flow_id].get("status") == BuildStatus.IN_PROGRESS:
                error_message = "Already building"
                yield str(StreamData(event="error", data={"error": error_message}))
                return

            graph_data = flow_data_store[flow_id].get("graph_data")

            if not graph_data:
                error_message = "No data provided"
                yield str(StreamData(event="error", data={"error": error_message}))
                return
            
            # logger.debug("total number_of_nodes:%s",len(graph_data['data']['nodes']))
            logger.debug("Building langchain object")
            try:
                # Some error could happen when building the graph
                graph = Graph.from_payload(graph_data)
            except Exception as exc:
                logger.exception(exc)
                error_message = str(exc)
                yield str(StreamData(event="error", data={"error": error_message}))
                return

            number_of_nodes = len(graph.nodes)
            flow_data_store[flow_id]["status"] = BuildStatus.IN_PROGRESS

            for i, vertex in enumerate(graph.generator_build(), 1):
                try:
                    log_dict = {
                        "log": f"Building node {vertex.vertex_type}",
                    }
                    yield str(StreamData(event="log", data=log_dict))
                    vertex.build()
                    params = vertex._built_object_repr()
                    valid = True
                    logger.debug(f"Building node {str(vertex.vertex_type)}")
                    logger.debug(f"Output: {params}")
                    if vertex.artifacts:
                        # The artifacts will be prompt variables
                        # passed to build_input_keys_response
                        # to set the input_keys values
                        artifacts.update(vertex.artifacts)
                except Exception as exc:
                    logger.exception(exc)
                    params = str(exc)
                    valid = False
                    flow_data_store[flow_id]["status"] = BuildStatus.FAILURE

                response = {
                    "valid": valid,
                    "params": params,
                    "id": vertex.id,
                    "progress": round(i / number_of_nodes, 2),
                }

                yield str(StreamData(event="message", data=response))

            langchain_object = graph.build()
            # print("============这里查看编译后，后台最后返回来的的对象是什么====================")

            # print(langchain_object)
            # print("==============langchain_object=============")

            # Now we  need to check the input_keys to send them to the client
            if hasattr(langchain_object, "input_keys"):
                input_keys_response = build_input_keys_response(
                    langchain_object, artifacts
                )
            else:
                input_keys_response = {
                    "input_keys": None,
                    "memory_keys": [],
                    "handle_keys": [],
                }
            yield str(StreamData(event="message", data=input_keys_response))
            chat_manager = service_manager.get(ServiceType.CHAT_MANAGER)
            chat_manager.set_cache(flow_id, langchain_object)
            # We need to reset the chat history
            chat_manager.chat_history.empty_history(flow_id)
            flow_data_store[flow_id]["status"] = BuildStatus.SUCCESS
        except Exception as exc:
            logger.exception(exc)
            logger.error("Error while building the flow: %s", exc)
            flow_data_store[flow_id]["status"] = BuildStatus.FAILURE
            yield str(StreamData(event="error", data={"error": str(exc)}))
        finally:
            yield str(StreamData(event="message", data=final_response))

    try:
        return StreamingResponse(event_stream(flow_id), media_type="text/event-stream")
    except Exception as exc:
        logger.error(f"Error streaming build: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/assistant/{flow_id}", response_model=ProcessResponse, status_code=201)
async def assistant(graph_data: dict, flow_id: str):
    # logger.debug("total number_of_nodes:%s",len(graph_data['data']['nodes']))
    contents=""
    i=0
    while i< len(graph_data['data']['nodes']):
        if(graph_data['data']['nodes'][i]['type']=="noteNode"):
            # contents.append(graph_data['data']['nodes'][i]['data']['value']) 
            contents+='\n'+graph_data['data']['nodes'][i]['data']['value']
        else:
            if(graph_data['data']['nodes'][i]['data']['type']=="Note" or graph_data['data']['nodes'][i]['data']['type']=="AINote"):
                contents+='\n'+graph_data['data']['nodes'][i]['data']['node']['template']['note']['value']

        i+=1
    try:
        if flow_id is None:
            raise ValueError("No ID provided")
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200  
        ).from_language(language="html")
        split_texts = text_splitter.split_text(contents)
        prompt_template = """请基于以下文本起一个标题:
        {texts}
        """
        # 总结:"""  

        # prompt_template='通过提供如下内容,起一个标题\\n{contents}'
        # prompt_template='将如下内容猜测我做这个笔记的意图,并为这个笔记白板起一个合适的标题\\n{contents}'        
        

        llm = ChatOpenAI(temperature=0.7, model_name="gpt-3.5-turbo-0613",openai_api_base=os.getenv("OPENAI_API_BASE"),openai_api_key=os.getenv("OPENAI_API_KEY"))
        # prompt=PromptTemplate(input_variables=[],output_parser=None, partial_variables={'contents': contents}, template=prompt_template, template_format='f-string', validate_template=True)

        prompt = PromptTemplate(template=prompt_template, input_variables=["texts"])
        # prompt.format(texts="\n\n".join(split_texts)) 
        
        chain = LLMChain(llm=llm,prompt=prompt)
        # logger.debug("contents:",contents)
        # response = chain.run(prompt=prompt_template)
        response = chain.predict(texts="\n\n".join(split_texts))

        resultDict={"flowId":flow_id,"msg":response}
        # logger.debug("result:",resultDict)
        return ProcessResponse(result=resultDict)
    except Exception as exc:
        logger.error(f"Error when call AI LLM: {exc}")
        return HTTPException(status_code=500, detail=str(exc))

