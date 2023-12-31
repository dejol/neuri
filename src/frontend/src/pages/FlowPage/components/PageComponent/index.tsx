import _, { cloneDeep } from "lodash";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  NodeChange,
  NodeDragHandler,
  OnEdgesDelete,
  OnSelectionChangeParams,
  SelectionDragHandler,
  addEdge,
  updateEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Panel,
  MarkerType,
  BackgroundVariant,
  ReactFlowInstance,
  Position,
} from "reactflow";
import GenericNode from "../../../../CustomNodes/GenericNode";
import Chat from "../../../../components/chatComponent";
import { alertContext } from "../../../../contexts/alertContext";
import { locationContext } from "../../../../contexts/locationContext";
import { TabsContext } from "../../../../contexts/tabsContext";
import { typesContext } from "../../../../contexts/typesContext";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import { APIClassType } from "../../../../types/api";
import { FlowType, NodeType } from "../../../../types/flow";
import { isValidConnection } from "../../../../utils/reactflowUtils";
import { isWrappedWithClass ,isValidImageUrl, getAssistantFlow, enforceMinimumLoadingTime, getAllRelatedNode, checkArray} from "../../../../utils/utils";
import ConnectionLineComponent from "../ConnectionLineComponent";
import ExtraSidebar from "../extraSidebarComponent";
import LeftFormModal from "../../../../modals/leftFormModal";
import SearchListModal from "../../../../modals/searchListModal";
import FolderPopover from "../FolderComponent";
import { Transition } from "@headlessui/react";
import IconComponent from "../../../../components/genericIconComponent";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import NoteNode from "../../../../CustomNodes/NoteNode";
import MindNode from "../../../../CustomNodes/MindNode";

import FloatingEdge from "../FloatingEdgeComponent";
import { postBuildInit, postNotesAssistant } from "../../../../controllers/API";
import LoadingComponent from "../../../../components/loadingComponent";
import { darkContext } from "../../../../contexts/darkContext";
import WebEditorModal from "../../../../modals/webEditorModal";
import { useSSE } from "../../../../contexts/SSEContext";
import {getNextBG} from "../../components/borderColorComponent";

export function ExtendButton(){
  const { setOpenModelList,openModelList} = useContext(locationContext);

  return (
    <>
    {/* <Panel position="top-left" className="m-0 mt-6">
      <ShadTooltip content="文件夹" side="right">
        <button onClick={()=>{setOpenFolderList(!openFolderList);}}
              className='mt-0'>
          <IconComponent name={openFolderList?"ChevronsLeft":"ChevronsRight"} className="side-bar-button-size " />
        </button>
        </ShadTooltip>
    </Panel> */}

    <Panel position="top-right" className="m-0 mt-6">
    <ShadTooltip content="模块" side="left">
      <button onClick={()=>{setOpenModelList(!openModelList);}}
            className='mt-0'>
        <IconComponent name={openModelList?"ChevronsRight":"ChevronsLeft"} className="side-bar-button-size " />
      </button>
      </ShadTooltip>
  </Panel>
  </>
  );
};



const nodeTypes = {
  genericNode: GenericNode,
  noteNode:NoteNode,
  mindNode:MindNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

export default function Page({ flow }: { flow: FlowType }) {
  let {
    updateFlow,
    uploadFlow,
    getNodeId,
    getNewEdgeId,
    paste,
    lastCopiedSelection,
    setLastCopiedSelection,
    tabsState,
    setTabsState,
    tabId,
    isBuilt, 
    setIsBuilt,
    getSearchResult,
    editNodeId
  } = useContext(TabsContext);
  const { types,reactFlowInstances,templates,data } = useContext(typesContext);
  const { dark } = useContext(darkContext);

  const reactFlowWrapper = useRef(null);
  const { takeSnapshot } = useContext(undoRedoContext);
  const { updateSSEData, isBuilding, setIsBuilding, sseData } = useSSE();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastSelection, setLastSelection] =
    useState<OnSelectionChangeParams>(null);
  const [open,setOpen]=useState(false);
  const [canOpen, setCanOpen] = useState(false);
  const {openFolderList,
      openMiniMap,openModelList,openAssistant,openWebEditor,setOpenWebEditor,setOpenSearchList,
      openSearchList,setIsInteractive,isInteractive,
      setExtraComponent, setExtraNavigation,screenWidth 
    } = useContext(locationContext);  

  // const [openSearch,setOpenSearch]=useState(false);
  const [conChanged,setConChanged]=useState(false);//内容是否已经变化，暂时用在判断AI 助手是否需要工作上
  // useEffect(() => {
  //   if(getSearchResult&&getSearchResult.length>0){
  //     setOpenSearch(true);
  //   }
  // },[getSearchResult]);

  useEffect(() => {
    // this effect is used to attach the global event handlers

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isWrappedWithClass(event, "nocopy")) {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === "c" &&
          lastSelection
        ) {
          event.preventDefault();
          setLastCopiedSelection(_.cloneDeep(lastSelection));
        }
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === "d" &&
          lastCopiedSelection
        ) {
          event.preventDefault();
          paste(lastCopiedSelection, {x: position.x,y: position.y});
        }
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === "v"
        ) {
          event.preventDefault();
          if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then((value:string)=>{
              if(event.shiftKey){
                try {
                  const jsonObject = JSON.parse(value);
                  takeSnapshot();
                  let root=createNoteNode(value,null);
                   let currZoom=reactFlowInstances.get(tabId).getViewport().zoom;
                  createNodesFromJson(position.x+(root.width+300)*currZoom,position.y,jsonObject,root.id);
                } catch (error) {
                  takeSnapshot();
                  createNewNote(value);
                }
              }
              // else{
              //   createNewNote(value);
              // }

            });
          }
        }


        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === "g" &&
          lastSelection
        ) {
          event.preventDefault();
        }
      }
    };
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [position, lastCopiedSelection, lastSelection]);

  const [selectionMenuVisible, setSelectionMenuVisible] = useState(false);

  const [loading,setLoading] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(
    flow.data?.nodes ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    flow.data?.edges ?? []
  );
  const { setViewport,screenToFlowPosition } = useReactFlow();
  const edgeUpdateSuccessful = useRef(true);
  useEffect(() => {
    let cloneRFI=cloneDeep(reactFlowInstances);
    if(cloneRFI.get(tabId) && flow){
      let vp=cloneRFI.get(tabId).getViewport();
      // console.log("edges:",reactFlowInstances.get(tabId).getEdges());
      if (vp&&!(vp.x==0 && vp.y==0 && vp.zoom==1)) {
        flow.data = reactFlowInstances.get(tabId).toObject();
        
        //  console.log("currentView:",reactFlowInstances.get(tabId).getViewport());

        // if(tabValues.get(tabId).viewport&&vp&&vp.x==0 && vp.y==0 && vp.zoom==1){
          // reactFlowInstances.get(tabId).setViewport(tabValues.get(tabId).viewport);
        // }
        // if(tabId==flow.id)
          updateFlow(flow);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges,nodes]);
  //update flow when tabs change
  useEffect(() => {
      // console.log("nodes:",flow?.data?.nodes);
      setNodes(flow?.data?.nodes ?? []);
      setEdges(flow?.data?.edges ?? []);
      if (reactFlowInstances.get(tabId)) {
        // setLoading(false);
        // console.log('flow viewport:',flow?.data?.viewport)
        // console.log('current viewport:',reactFlowInstances.get(tabId).getViewport())
        if(flow?.data?.viewport){
          if(!(flow.data?.viewport.x==0&&flow.data?.viewport.y==0&&flow.data?.viewport.zoom==1)){
            // reactFlowInstances.get(tabId).setViewport(flow?.data?.viewport);
            setViewport(flow?.data?.viewport);
          }
        }else{
          // reactFlowInstances.get(tabId).setViewport({ x: 1, y: 0, zoom: 0.5 });
          setViewport({ x: 1, y: 0, zoom: 0.5 });
        }

        
        // reactFlowInstances.get(tabId).fitView();
      }
  }, [flow
    // ,reactFlowInstances.get(tabId)
    , setEdges, setNodes
    // , setViewport //不理解这里为啥要用setViewport
  ]);
  
  //set extra sidebar
  useEffect(() => {
    setExtraComponent(<ExtraSidebar />);
    setExtraNavigation({ title: "Components" });
  }, [setExtraComponent, setExtraNavigation]);

  const onEdgesChangeMod = useCallback(
    (change: EdgeChange[]) => {
      onEdgesChange(change);
      setNodes((node) => {
        let newX = _.cloneDeep(node);
        return newX;
      });
      setTabsState((prev) => {
        return {
          ...prev,
          [tabId]: {
            ...prev[tabId],
            isPending: true,
          },
        };
      });
    },
    [onEdgesChange, setNodes, setTabsState, tabId]
  );
  function deleteMindNode(nodeId){
          
    if( nodeId.startsWith('mindNode')){
      let nodeIds=[];
      let edgeIds=[];
      getAllRelatedNode(flow,nodeId,edgeIds,nodeIds);
      setEdges(
        edges.filter(
          (edge) =>
            !edgeIds.some(
              (id) => id === edge.id
            )
        )
      );

      setNodes(
        nodes.filter(
          (node) =>
            !nodeIds.some(
              (nodeId) => nodeId === node.id
            )
        )
      );

      // let node = flow.data.nodes.find((node)=>node.id==nodeId);
      // node.data.numOftarget-=1;
    }

  }
  const onNodesChangeMod = useCallback(
    (change: NodeChange[]) => {
      setConChanged(true);
      onNodesChange(change);
      setTabsState((prev) => {
        return {
          ...prev,
          [tabId]: {
            ...prev[tabId],
            isPending: true,
          },
        };
      });
    },
    [onNodesChange, setTabsState, tabId]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      // console.log("source:%s, target:%s",params.sourceHandle,params.targetHandle);
      takeSnapshot();
      let newEdeg={
        ...params,
        style: { 
          // stroke: "#555",
          strokeWidth:6 
        },

      };
      if(params.target.startsWith("mindNode-")||params.target.startsWith("noteNode-")||params.target.startsWith("Note-")){
       
        newEdeg["markerEnd"]={
          type: MarkerType.ArrowClosed,
          // color: 'black',
        };
        newEdeg["type"]='floating';
        newEdeg["id"]=getNewEdgeId("mindEdge");
        if(params.target.startsWith("mindNode-")&&params.source.startsWith("mindNode-")){
          newEdeg["source"]=params.target;
          newEdeg["target"]=params.source;
        }
      }else{
        newEdeg["className"]=
          (params.targetHandle.split("|")[0] === "Text"
            ? "stroke-foreground "
            : "stroke-foreground ") + " stroke-connection"; 
            newEdeg["animated"]= params.targetHandle.split("|")[0] === "Text";

      }

      setEdges((eds) =>
        addEdge(
          newEdeg,
          eds
        )
      );
      setNodes((node) => {
        let newX = _.cloneDeep(node);
        return newX;
      });
    },
    [setEdges, setNodes, takeSnapshot]
  );

  const connectingNodeId = useRef(null);
  const isLock = useRef(false);
  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  //just for testing ,will be deleted when system publiched
  const testJson={
    "桥头镇": {
      "概述": "2019年",
      "第一产业": "桥头镇为澄迈县的农业大镇",
      "第二产业": "桥头近年来在第一产业发展的",
      "第三产业": "桥头镇依托区位优势，"
    },
    "西岸村": {
      "概述": "西岸村委会位于桥头镇的东部",
      "基地": {
        "A":"位于西岸村的陆侨无核荔枝",
        "B":"位于西岸村的陆侨无核荔枝"
      }
    },
    "桥": {
      "概述": "2020年"
    }
  };

  function createNodesFromJson(clientX,clientY,jsonObj,sourceId){
    let numX=1;
    let numY=0;
    let currZoom=reactFlowInstances.get(tabId).getViewport().zoom;
    for (let key in jsonObj) {
      if (jsonObj[key] !== null && typeof jsonObj[key] === "object" ) {
        if(checkArray(jsonObj[key])){
          createNodeEdge(clientX+400*numX*currZoom,clientY+200*numY*currZoom,(key+": "+jsonObj[key]),sourceId);
        }else{
          let newNodeId=createNodeEdge(clientX,clientY+200*numY*currZoom,key,sourceId);
          numY+=createNodesFromJson(clientX+400*numX*currZoom,clientY+200*numY*currZoom,jsonObj[key],newNodeId);
        }
      }else{
        createNodeEdge(clientX+400*numX*currZoom,clientY+200*numY*currZoom,(key+": "+jsonObj[key]),sourceId);
      }
      numY+=1;
    }
    return numY-1;
  }
  function createNodeEdge(clientX,clientY,content,sourceId){
      // we need to remove the wrapper bounds, in order to get the correct position
      // const reactflowBounds = reactFlowWrapper.current.getBoundingClientRect();       
      let sourceNode=flow?.data?.nodes.find((n)=>n.id==sourceId);
      let newNode=createNoteNode(content, 
          // reactFlowInstances.get(tabId).project({
          // x: clientX - reactflowBounds.left,
          // y: clientY - reactflowBounds.top,
          // }),
          reactFlowInstances.get(tabId).screenToFlowPosition({
                  x: clientX,
                  y: clientY
                }),          
          "mindNode",getNextBG((sourceNode?sourceNode.data.borderColor:""))


      );

      let newEdeg={
      id:getNewEdgeId("mindEdeg"),
      source:sourceId,
      target:newNode.id,
      style: { 
        stroke: getNextBG((sourceNode?sourceNode.data.borderColor:"")),
        strokeWidth:6,
        
      },
      className:"stroke-foreground stroke-connection ",
      // markerEnd:{
      //   type: MarkerType.ArrowClosed,
      //   // color: 'black',
      // },
      type:(sourceNode.type == "noteNode"||sourceNode.type=="genericNode")?"simplebezier":"smoothstep",
      selectable:false,
      deletable:false,
      updatable:false,
      // animated:true,
      };

      setEdges((eds) =>
      addEdge(
        newEdeg,
        eds
      )
      );
      if(!sourceNode.data.numOftarget)sourceNode.data.numOftarget=0;
      sourceNode.data.numOftarget+=1;
      return newNode.id;
  }
  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');
      const targetIsRunNote = event.target.dataset.nodeid?.startsWith("Note-");
      if (!isLock.current){
        if(targetIsPane) {
          // createNodesFromJson(event.clientX,event.clientY,testJson,connectingNodeId.current);
          createNodeEdge(event.clientX,event.clientY,"",connectingNodeId.current)
        }
        if(targetIsRunNote){
          let newEdeg={
            id:getNewEdgeId("finalEdge"),
            source:connectingNodeId.current,
            target:event.target.dataset.nodeid,
            style: { 
              strokeWidth:6,
            },
            className:"stroke-foreground stroke-connection ",
            // markerEnd:{
            //   type: MarkerType.ArrowClosed,
            // //   // color: 'black',
            // },
            type:"floating",
            animated:true,
            };
      
            setEdges((eds) =>
              addEdge(
                newEdeg,
                eds
              )
            );
        }
     }
    },
    [ ],
  );

  const onNodeDragStart: NodeDragHandler = useCallback(() => {
    // 👇 make dragging a node undoable
    takeSnapshot();
    // 👉 you can place your event handlers here
  }, [takeSnapshot]);

  const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
    // 👇 make dragging a selection undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    // 👇 make deleting edges undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.types.some((types) => types === "nodedata")) {
      event.dataTransfer.dropEffect = "move";
    } else {
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer.types.some((types) => types === "nodedata")) {
        takeSnapshot();

        // Get the current bounds of the ReactFlow wrapper element
        // const reactflowBounds =
        //   reactFlowWrapper.current.getBoundingClientRect();

        // Extract the data from the drag event and parse it as a JSON object
        // let oo=JSON.parse(
        //   event.dataTransfer.getData("nodedata")
        // );
        // console.log("oo value:",oo);
        let data: { type: string; node?: APIClassType } = JSON.parse(
          event.dataTransfer.getData("nodedata")
        );
        

        // If data type is not "chatInput" or if there are no "chatInputNode" nodes present in the ReactFlow instance, create a new node
        // Calculate the position where the node should be created
        // console.log("reactFlowInstances:",reactFlowInstances);
        const position = reactFlowInstances.get(tabId).screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
        
        // .project({
        //   x: event.clientX - reactflowBounds.left,
        //   y: event.clientY - reactflowBounds.top,
        // });

        // Generate a unique node ID
        let { type } = data;
        let newId = getNodeId(type);
        let newNode: NodeType;
        if(data.type=="noteNode"){
          // newNode = {
          //   id: newId,
          //   type: "noteNode",
          //   position,
          //   data: {
          //     type:"noteNode",
          //     value: data.node?data.node.value:"",
          //     id:newId
          //   },
          // };
          //   let nodesList=flow.data.nodes;
          //   nodesList.push(newNode);
          //   reactFlowInstance.setNodes(nodesList);
          if(data.node?.value){
            // createNoteNode(data.node?.value,position);
            createNewNote(data.node?.value);
          }else{
            // createNoteNode("",position);
            createNewNote(data.node?.value);

          }
        }else{
          if (data.type !== "groupNode") {
            // Create a new node object
            //console.info("create a new node object here1");//鼠标拖拉生成node
  
            newNode = {
              id: newId,
              type: "genericNode",
              position,
              data: {
                ...data,
                id: newId,
                value: null,
              },
            };
          }else{
            // Create a new node object
            newNode = {
              id: newId,
              type: "genericNode",
              position,
              data: {
                ...data,
                id: newId,
                value: null,
              },
            };
            // console.info("create a new node object here");
            // Add the new node to the list of nodes in state
          }
          setNodes((nds) => nds.concat(newNode));
        }

        
      } else if (event.dataTransfer.types.some((types) => types === "Files")) {
        takeSnapshot();
        uploadFlow(false, event.dataTransfer.files.item(0));
      }

    },
    // Specify dependencies for useCallback
    [getNodeId, reactFlowInstances.get(tabId), setNodes, takeSnapshot]
  );

  useEffect(() => {
    setLoading(true);
    // console.log("nodes:",flow);
    // return () => {
    //   if (tabsState && tabsState[flow.id]?.isPending) {
    //     saveFlow(flow);
    //   }
    // };  //不理解这里，暂时注释
    // console.log("flow:",flow);
  }, []);

  const onDelete = useCallback(
    (mynodes) => {
      takeSnapshot();
      mynodes.forEach((nod)=>{
        deleteMindNode(nod.id);
      });
      setEdges(
        edges.filter(
          (edge) =>
            !mynodes.some(
              (node) => edge.source === node.id || edge.target === node.id
            )
        )
      );
    },
    [takeSnapshot, edges, setEdges]
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      // console.log("oldEdge:",oldEdge);
      // console.log("newConnection:",newConnection);
      if (isValidConnection(newConnection, reactFlowInstances.get(tabId))) {
        edgeUpdateSuccessful.current = true;
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
      }
    },
    [reactFlowInstances.get(tabId), setEdges]
  );

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((edg) => edg.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const [selectionEnded, setSelectionEnded] = useState(false);

  const onSelectionEnd = useCallback(() => {
    setSelectionEnded(true);
  }, []);
  const onSelectionStart = useCallback((event) => {
    event.preventDefault();
    setSelectionEnded(false);
  }, []);
  // Workaround to show the menu only after the selection has ended.
  useEffect(() => {
    
    if (selectionEnded && lastSelection && lastSelection.nodes.length > 1) {
      setSelectionMenuVisible(true);
    } else {
      setSelectionMenuVisible(false);
    }
  }, [selectionEnded, lastSelection]);

  const onSelectionChange = useCallback((flow) => {
    
    setLastSelection(flow);
  }, []);

function createNewNote(newValue){
  if(newValue&&isValidImageUrl(newValue)){
    newValue="<img src='"+newValue+"'/>";
  }
  let newData = { type: "Note",node:data["notes"]["Note"]};
  let { type } = newData;
  let newId = getNodeId(type);
  let newNode: NodeType;
  // let bounds = reactFlowWrapper.current.getBoundingClientRect();
  const newPosition = reactFlowInstances.get(tabId).screenToFlowPosition({
                        x: position.x,
                        y: position.y    
                      });
  // .project({
  //   x: position.x - bounds.left,
  //   y: position.y - bounds.top,    
  // });

  newData.node.template.note.value=newValue;
  newNode = {
    id: newId,
    type: "genericNode",
    position:newPosition,
    
    data: {
      ...newData,
      id: newId,
      value: null,
    },
  };
  let nodesList=flow.data.nodes;
  nodesList.push(newNode);
  reactFlowInstances.get(tabId).setNodes(nodesList);
}
function createNoteNode(newValue,newPosition,type?:string,borderColour?:string){
  if(newValue&&isValidImageUrl(newValue)){
    newValue="<img src='"+newValue+"'/>";
  }

  if(!type){
    type="noteNode";
  }
  let newId = getNodeId(type);
  if(!newPosition){
    // let bounds = reactFlowWrapper.current.getBoundingClientRect();
    newPosition = reactFlowInstances.get(tabId).screenToFlowPosition({
      x: position.x,
      y: position.y    
    });
    // .project({
    //   x: position.x - bounds.left,
    //   y: position.y - bounds.top,    
    // });
  }
  // console.log("newPosition:",newPosition);
  let newNode = {
    id: newId,
    type: type,
    position:newPosition,
    data: {
      id:newId,
      type:type,
      value:newValue,
      borderColor:borderColour??"",
      numOftarget:0
    },
    width:220,
    height:220,
    selected:false,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
  let nodesList=flow.data.nodes;
  
  nodesList.push(newNode);

  reactFlowInstances.get(tabId).setNodes(nodesList);
  return newNode;
}


  
  const assistantOn = useRef(false);
  const changedContent = useRef(false);
  useEffect(()=>{
    assistantOn.current=openAssistant;
    let delay=1000*60; //one minute
    let intervalId = null;
    if(assistantOn.current){
      intervalId = setInterval(
            ()=>{
            if(assistantOn.current&&flow&&changedContent.current&&!isBuilding){
              postNotesAssistant(flow).then((resp)=>{
                if(resp){
                  handleBuild(getAssistantFlow(flow.id,resp.data.result.msg));
                     
                }
              });

            }
            setConChanged(false);
          }, 
        delay);
    }else{
      clearInterval(intervalId);
    }
    return () => {
      clearInterval(intervalId);
    };
  },[openAssistant]);

  useEffect(()=>{
    changedContent.current=conChanged;
  },[conChanged]);  

  function initFlowInstance(reactFlowIns:ReactFlowInstance){
    // setReactFlowInstance(reactFlowIns);
    // console.log("call initFlowInstance[flow]:",flow.name,flow.data?.viewport);
    // console.log("call initFlowInstance[instance]:",flow.name,reactFlowIns.getViewport());
    reactFlowInstances.set(tabId,reactFlowIns);
    if(flow.id==tabId && flow.data?.viewport){
      if(!(flow.data?.viewport.x==0&&flow.data?.viewport.y==0&&flow.data?.viewport.zoom==1)){
        // reactFlowIns.setViewport(flow.data?.viewport);
        setViewport(flow.data?.viewport);
      }
    }
    setLoading(false);
  }
  // check is there has AINote 
  // function checkAINote(){
    // let isAINote:boolean=false;
    // if (!flow.data || !flow.data.nodes) return;
    //   flow.data.nodes.forEach((node: NodeType) => {
    //     if(node.data.type=="AINote"&&(node.data.node.runnable==undefined||node.data.node.runnable)){
    //       isAINote=true;
    //       return;
    //     }
    // });
    // return false;
  // }
  // useEffect(()=>{
  //   if(tabsState[flow.id]){
  //     console.log("formKeysData:",tabsState[flow.id].formKeysData)
  //   }
  // },[tabsState[flow.id]])

  async function handleBuild(flow: FlowType) {
    
    try {
      if (isBuilding) {
        return;
      }
      const minimumLoadingTime = 200; // in milliseconds
      const startTime = Date.now();
      setIsBuilding(true);
      const allNodesValid = await streamNodeData(flow);
      await enforceMinimumLoadingTime(startTime, minimumLoadingTime);
      setIsBuilt(allNodesValid);
      if (!allNodesValid) {
        console.error( "Oops! Looks like you missed something");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsBuilding(false);
    }
  }

  async function streamNodeData(flow: FlowType) {
    // Step 1: Make a POST request to send the flow data and receive a unique session ID
    const response = await postBuildInit(flow);
    const { flowId } = response.data;
    // Step 2: Use the session ID to establish an SSE connection using EventSource
    let validationResults = [];
    let finished = false;
    const apiUrl = `/api/v1/build/stream/${flowId}`;
    const eventSource = new EventSource(apiUrl);
    eventSource.onmessage = (event) => {
      // If the event is parseable, return
      if (!event.data) {
        return;
      }
      const parsedData = JSON.parse(event.data);
      // console.log("parseData:",parsedData);
      // if the event is the end of the stream, close the connection
      if (parsedData.end_of_stream) {
        // Close the connection and finish
        finished = true;
        eventSource.close();

        return;
      } else if (parsedData.log) {
        // If the event is a log, log it
        // setSuccessData({ title: parsedData.log });
      } else if (parsedData.input_keys !== undefined) {
        // console.log("flowId:",flowId);
        setTabsState((old) => {
          return {
            ...old,
            [flowId]: {
              ...old[flowId],
              formKeysData: parsedData,
            },
          };
        });
      } else {
        // Otherwise, process the data
        const isValid = processStreamResult(parsedData);
        // setProgress(parsedData.progress);
        validationResults.push(isValid);
      }
    };

    eventSource.onerror = (error: any) => {
      console.error("EventSource failed:", error);
      eventSource.close();
      if (error.data) {
        const parsedData = JSON.parse(error.data);
        // setErrorData({ title: parsedData.error });
        setIsBuilding(false);
      }
    };
    // Step 3: Wait for the stream to finish
    let lengthOfRunnable=0;
    flow.data.nodes.forEach(node => {
      if((node.type=="genericNode")&&
         (node.data.node.runnable==undefined||node.data.node.runnable)){
        lengthOfRunnable+=1;
      }
    });
    while (!finished) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      finished = validationResults.length === lengthOfRunnable;
    }
    // setOpen(finished);
    // Step 4: Return true if all nodes are valid, false otherwise
    return validationResults.every((result) => result);
  }

  function processStreamResult(parsedData) {
    // Process each chunk of data here
    // Parse the chunk and update the context
    try {
      updateSSEData({ [parsedData.id]: parsedData });
    } catch (err) {
      console.log("Error parsing stream data: ", err);
    }
    return parsedData.valid;
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* {
        open && isBuilt && tabsState[flow.id] &&
          tabsState[flow.id].formKeysData 
          && canOpen
          &&  (
            <div className="left-side-bar-arrangement">
            <LeftFormModal
            open={open}
            setOpen={setOpen}
            key={flow.id}
            flow={flow}
          />
          </div>
          )
          }         */}

     

      {/* {openSearch && getSearchResult&&getSearchResult.length>0&&( */}
      

        {/* )}                   */}


      {/* Main area */}

      <main className="flex flex-1">
        {/* Primary column */}
          <div className="h-full w-full">
            {loading ? (
              <div className="loading-component-div h-full">
                <LoadingComponent remSize={30} />
              </div>
            ):(
              <div className="h-full w-full" ref={reactFlowWrapper}>
                <>
                {Object.keys(templates).length > 0 &&
                Object.keys(types).length > 0 ? (
                  <>
                  {openWebEditor&&flow&&(
                    <WebEditorModal
                      setOpen={setOpenWebEditor}
                      open={openWebEditor}
                      flow_id={flow.id}
                      node_id={editNodeId}
                    ></WebEditorModal>
                )}
                  
                  <div className={"h-full w-full"+(openWebEditor?" hidden ":"")}>
                    <ReactFlow
                      // id={flow.id}
                      snapToGrid={true}
                      snapGrid={[50,50]}
                      nodes={nodes}
                      onMove={() => {
                        if (reactFlowInstances.get(tabId)&&tabId==flow.id){
                          // console.log("instances:",flow);
                          // console.log("call updateFlow:",reactFlowInstances.get(tabId).toObject());
                          // console.log("call updateFlow onMove:",flow.name,reactFlowInstances.get(tabId).getViewport());
                          // let viewport=reactFlowInstances.get(tabId).getViewport();
                          // if(viewport&&viewport.x==0&&viewport.y==0&&viewport.zoom==1){
                          //   updateFlow({
                          //     ...flow,
                          //     data:{
                          //       nodes:reactFlowInstances.get(tabId).toObject().nodes,
                          //       edges:reactFlowInstances.get(tabId).toObject().edges,
                          //       viewport:flow.data.viewport
                          //     } ,
                          //   });
                          // }else{
                            updateFlow({
                              ...flow,
                              data: reactFlowInstances.get(tabId).toObject(),
                            });
                          // }
                          

                        }
                      }}
                      edges={edges}
                      onNodesChange={onNodesChangeMod}
                      onEdgesChange={onEdgesChangeMod} 
                      onConnect={onConnect} //链接线 连接成功后执行
                      onConnectEnd={onConnectEnd}
                      onConnectStart={onConnectStart}
                      disableKeyboardA11y={true}
                      // onLoad={initFlowInstance}
                      onInit={initFlowInstance}
                      nodeTypes={nodeTypes}
                      edgeTypes={edgeTypes}
                      onEdgeUpdate={onEdgeUpdate}
                      onEdgeUpdateStart={onEdgeUpdateStart}
                      onEdgeUpdateEnd={onEdgeUpdateEnd}
                      onNodeDragStart={onNodeDragStart}
                      onSelectionDragStart={onSelectionDragStart}
                      onSelectionEnd={onSelectionEnd}
                      onSelectionStart={onSelectionStart}
                      onEdgesDelete={onEdgesDelete}
                      connectionLineComponent={ConnectionLineComponent} //定义链接线(连接成功前)的样式
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                      onNodesDelete={onDelete}
                      onSelectionChange={onSelectionChange}
                      className="theme-attribution"
                      minZoom={0.01}
                      maxZoom={8}
                      
                    >
                      {openMiniMap&&(
                        <MiniMap pannable={true} 
                        position="bottom-right" 
                        zoomable={true} 
                        ariaLabel="Zoom In/Out & Move" 
                        className="dark:bg-muted"
                        />
                      )}
                      <Controls
                        className="bg-muted fill-foreground stroke-foreground text-primary
                      [&>button]:border-b-border hover:[&>button]:bg-border"
                      showZoom={false}
                      position="bottom-right"
                      onInteractiveChange={(status)=>{
                        setIsInteractive(!status);
                        isLock.current=!status;
                        }
                      }
                      >
                      </Controls>
                      <ExtendButton/>
                      <Background 
                      //  color="#ccc" 
                      variant={dark?BackgroundVariant.Dots:BackgroundVariant.Lines}
                      // gap={50}
                      id={flow.id}
                      />
                    </ReactFlow>
                    {tabId===flow.id&&(
                      <div>
                      <Transition
                        show={openFolderList}
                        // enter="transition-transform duration-500 ease-out"
                        // enterFrom={"transform translate-x-[-100%]"}
                        // enterTo={"transform translate-x-0"}
                        // leave="transition-transform duration-500 ease-in"
                        // leaveFrom={"transform translate-x-0"}
                        // leaveTo={"transform translate-x-[-100%]"}
                        // className={"chat-message-modal-thought-cursor"}
                      >
                        <div className="fixed top-[2.8rem] left-0 h-[93%]">
                          <FolderPopover />
                        </div>
                      </Transition>
                      <Transition
                        show={openSearchList}
                        // enter="transition-transform duration-500 ease-out"
                        // enterFrom={"transform translate-x-[-100%]"}
                        // enterTo={"transform translate-x-200"}
                        // leave="transition-transform duration-500 ease-in"
                        // leaveFrom={"transform translate-x-200"}
                        // leaveTo={"transform translate-x-[-100%]"}
                        // className={"chat-message-modal-thought-cursor"}
            
                      >
                      <div className="fixed top-[2.8rem] left-[13rem] h-[93%]">
                        <SearchListModal
                          open={openSearchList}
                          setOpen={setOpenSearchList}
                          flowList={getSearchResult.flows}
                          noteList={getSearchResult.notes}
                          searchKeyword={getSearchResult.keyword}
                          folderId={getSearchResult.folderId}
                        />
                    </div>
                  </Transition> 
                    </div>
                    )}
                    <Chat open={open} setOpen={setOpen} isBuilt={isBuilt} setIsBuilt={setIsBuilt} canOpen={canOpen} setCanOpen={setCanOpen} flow={flow}/>
                    {isBuilt &&
                      tabsState[flow.id] &&
                      tabsState[flow.id].formKeysData && 
                      // !isAINote&&
                       canOpen&&(
                        <Transition
                        show={open}
                        appear={true}
                        enter="transition-transform duration-500 ease-out"
                        enterFrom={"transform translate-x-[-100%]"}
                        enterTo={"transform translate-x-0"}
                        leave="transition-transform duration-500 ease-in"
                        leaveFrom={"transform translate-x-0"}
                        leaveTo={"transform translate-x-[-100%]"}
                        // className={"chat-message-modal-thought-cursor"}

                      > 
                      <div className="fixed bottom-14 left-0">   
                        <div className={"left-side-bar-arrangement shadow-lg"+(screenWidth<=1024?" w-[24rem]":"")}>     
                        <LeftFormModal
                          key={flow.id}
                          flow={flow}
                          open={open}
                          setOpen={setOpen}
                        />
                        </div>   
                      </div>
                      </Transition>
                      )}
                      
                  </div>
                  
                  </>
                ) : (
                  <></>
                )}
                </>
              </div>
            )}
          </div>
      </main>

      {flow&&(
        <>
            <Transition
            show={openModelList}
            enter="transition-transform duration-500 ease-out"
            enterFrom={"transform translate-x-[100%]"}
            enterTo={"transform translate-x-0"}
            leave="transition-transform duration-500 ease-in"
            leaveFrom={"transform translate-x-0"}
            leaveTo={"transform translate-x-[100%]"}
            className={"chat-message-modal-thought-cursor"}
          >
            <ExtraSidebar />
          </Transition>
        </>
      )}

     </div>
  );
}
