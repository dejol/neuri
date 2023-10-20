import _, { cloneDeep } from "lodash";
import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
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
import { isWrappedWithClass ,isValidImageUrl, classNames} from "../../../../utils/utils";
import ConnectionLineComponent from "../ConnectionLineComponent";
import ExtraSidebar from "../extraSidebarComponent";
import LeftFormModal from "../../../../modals/leftFormModal";
import SearchListModal from "../../../../modals/searchListModal";
import FolderPopover from "../FolderComponent";
import { Transition } from "@headlessui/react";
import IconComponent from "../../../../components/genericIconComponent";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import NoteNode from "../../../../CustomNodes/NoteNode";
import FloatingEdge from "../FloatingEdgeComponent";
import { postNotesAssistant } from "../../../../controllers/API";
import LoadingComponent from "../../../../components/loadingComponent";
import { darkContext } from "../../../../contexts/darkContext";
import WebEditorModal from "../../../../modals/webEditorModal";
import { Box, Typography } from "@mui/material";
// import LeftFormModal from "../../../../modals/leftFormModal";

export function ExtendButton(){
  // const { setOpenFolderList,openFolderList } = useContext(TabsContext);
  const { setOpenModelList,openModelList } = useContext(TabsContext);
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
};

export default function Page({ flow }: { flow: FlowType }) {
  let {
    updateFlow,
    uploadFlow,
    addFlow,
    getNodeId,
    paste,
    lastCopiedSelection,
    setLastCopiedSelection,
    tabsState,
    saveFlow,
    setTabsState,
    tabId,
    loginUserId,
  } = useContext(TabsContext);
  const { types, 
    // reactFlowInstance,
     reactFlowInstances,
    // setReactFlowInstance,
     templates,data } =
    useContext(typesContext);
    const { dark } = useContext(darkContext);

  const reactFlowWrapper = useRef(null);
  const {setNoticeData } = useContext(alertContext);

  const { takeSnapshot } = useContext(undoRedoContext);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastSelection, setLastSelection] =
    useState<OnSelectionChangeParams>(null);
  const [open,setOpen]=useState(false);
  const [canOpen, setCanOpen] = useState(false);
  const {tabValues,isBuilt, setIsBuilt,getSearchResult,openFolderList,openMiniMap,openModelList,openAssistant,openWebEditor,setOpenWebEditor,editNodeId } = useContext(TabsContext);
  const [openSearch,setOpenSearch]=useState(false);
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
          let bounds = reactFlowWrapper.current.getBoundingClientRect();
          paste(lastCopiedSelection, {
            x: position.x - bounds.left,
            y: position.y - bounds.top,
          });
        }
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === "v"
        ) {
          event.preventDefault();
          if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then((value:string)=>{
              // createNewNote(value);
              createNoteNode(value,null);
              // console.log(value);
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

  const { setExtraComponent, setExtraNavigation } = useContext(locationContext);
  const { setErrorData } = useContext(alertContext);
  const [loading,setLoading] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(
    flow.data?.nodes ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    flow.data?.edges ?? []
  );
  const { setViewport } = useReactFlow();
  const edgeUpdateSuccessful = useRef(true);
  useEffect(() => {
    let cloneRFI=cloneDeep(reactFlowInstances);
    if(cloneRFI.get(tabId) && flow){
      let vp=cloneRFI.get(tabId).getViewport();
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
        setViewport(flow?.data?.viewport ?? { x: 1, y: 0, zoom: 0.5 });
        // reactFlowInstances.get(tabId).fitView();
      }
  }, [flow
    ,reactFlowInstances.get(tabId)
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
        className:
          (params.targetHandle.split("|")[0] === "Text"
            ? "stroke-foreground "
            : "stroke-foreground ") + " stroke-connection",
        animated: params.targetHandle.split("|")[0] === "Text",
      };
      if(params.target.indexOf("noteNode")>=0){
        newEdeg["markerEnd"]={
          type: MarkerType.ArrowClosed,
          // color: 'black',
        };
        newEdeg["type"]='floating';
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
        const reactflowBounds =
          reactFlowWrapper.current.getBoundingClientRect();

        // Extract the data from the drag event and parse it as a JSON object
        let data: { type: string; node?: APIClassType } = JSON.parse(
          event.dataTransfer.getData("nodedata")
        );
        // console.log("data:",data);

        // If data type is not "chatInput" or if there are no "chatInputNode" nodes present in the ReactFlow instance, create a new node
        // Calculate the position where the node should be created
        // console.log("reactFlowInstances:",reactFlowInstances);
        const position = reactFlowInstances.get(tabId).project({
          x: event.clientX - reactflowBounds.left,
          y: event.clientY - reactflowBounds.top,
        });

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
            createNoteNode(data.node?.value,position);
          }else{
            createNoteNode("",position);

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
    // return () => {
    //   if (tabsState && tabsState[flow.id]?.isPending) {
    //     saveFlow(flow);
    //   }
    // };
  }, []);

  const onDelete = useCallback(
    (mynodes) => {
      takeSnapshot();
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

// function createNewNote(newValue){
//   let newData = { type: "Note",node:data["notes"]["Note"]};
//   let { type } = newData;
//   let newId = getNodeId(type);
//   let newNode: NodeType;
//   let bounds = reactFlowWrapper.current.getBoundingClientRect();
//   const newPosition = reactFlowInstance.project({
//     x: position.x - bounds.left,
//     y: position.y - bounds.top,    
//   });
//   newData.node.template.note.value=newValue;
//   newNode = {
//     id: newId,
//     type: "genericNode",
//     position:newPosition,
    
//     data: {
//       ...newData,
//       id: newId,
//       value: null,
//     },
//   };
//   let nodesList=flow.data.nodes;
//   nodesList.push(newNode);
//   reactFlowInstance.setNodes(nodesList);
// }
function createNoteNode(newValue,newPosition){
  if(newValue&&isValidImageUrl(newValue)){
    newValue="<img src='"+newValue+"'/>";
  }
  let newId = getNodeId("noteNode");
  if(!newPosition){
    let bounds = reactFlowWrapper.current.getBoundingClientRect();
    newPosition = reactFlowInstances.get(tabId).project({
      x: position.x - bounds.left,
      y: position.y - bounds.top,    
    });
  }

  let newNode = {
    id: newId,
    type: "noteNode",
    position:newPosition,
    data: {
      id:newId,
      type:"noteNode",
      value:newValue,
    },
    width:220,
    height:220,
    selected:false,
  };
  // console.log("nodeNode:",newNode);
  let nodesList=flow.data.nodes;
  
  nodesList.push(newNode);

  reactFlowInstances.get(tabId).setNodes(nodesList);
}

  const edgeTypes = {
    floating: FloatingEdge,
  };
  
  const assistantOn = useRef(false);
  const changedContent = useRef(false);
  useEffect(()=>{
    assistantOn.current=openAssistant;
    let delay=1000*60; //one minute
    let intervalId = null;
    if(assistantOn.current){
      intervalId = setInterval(callAssistant, delay);
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
  function callAssistant(){
    if(assistantOn.current&&flow&&changedContent.current){
      // console.log("call assistant")
      postNotesAssistant(flow).then((resp)=>{
        // console.log("call assistant:",resp)
        if(resp){
          setNoticeData({title:resp.data.result.msg})
        }
      });
    }
    setConChanged(false);
  };
  function initFlowInstance(reactFlowIns:ReactFlowInstance){
    // setReactFlowInstance(reactFlowIns);
    reactFlowInstances.set(tabId,reactFlowIns);
    if(flow.id==tabId && flow.data?.viewport){

      setViewport(flow.data?.viewport);
    }
    // console.log("set flow and params0:",reactFlowInstances.get(tabId).getViewport());

    setLoading(false);
    // console.log("set flow instances:",tabId,reactFlowIns);
    // console.log("set flow and params:",reactFlowIns.viewportInitialized,reactFlowIns.getViewport());

    // console.log("set nodes instances:",reactFlowIns.getNodes());
    // console.log("set flowMap instances:",reactFlowInstances.get(tabId).getNodes());


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
{/*       
      <Transition
            show={openSearch && getSearchResult&&getSearchResult.length>0}
            enter="transition-transform duration-500 ease-out"
            enterFrom={"transform translate-x-[-100%]"}
            enterTo={"transform translate-x-0"}
            leave="transition-transform duration-500 ease-in"
            leaveFrom={"transform translate-x-0"}
            leaveTo={"transform translate-x-[-100%]"}
            className={"chat-message-modal-thought-cursor"}

          >
            <div className="search-list-bar-arrangement">
            <SearchListModal
            open={openSearch}
            setOpen={setOpenSearch}
            results={getSearchResult}
          />
          </div>
        </Transition> */}
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
                          // console.log("call updateFlow onMove:",reactFlowInstances.get(tabId).getViewport());
                          let viewport=reactFlowInstances.get(tabId).getViewport();
                          if(viewport&&viewport.x==0&&viewport.y==0&&viewport.zoom==1){
                            updateFlow({
                              ...flow,
                              data:{
                                nodes:reactFlowInstances.get(tabId).toObject().nodes,
                                edges:reactFlowInstances.get(tabId).toObject().edges,
                                viewport:flow.data.viewport
                              } ,
                            });
                          }else{
                            updateFlow({
                              ...flow,
                              data: reactFlowInstances.get(tabId).toObject(),
                            });
                          }
                          

                        }
                      }}
                      edges={edges}
                      onNodesChange={onNodesChangeMod}
                      onEdgesChange={onEdgesChangeMod} 
                      onConnect={onConnect} //链接线 连接成功后执行
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
                    <Chat open={open} setOpen={setOpen} isBuilt={isBuilt} setIsBuilt={setIsBuilt} canOpen={canOpen} setCanOpen={setCanOpen} flow={flow}/>
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
        )}
     </div>
  );
}
