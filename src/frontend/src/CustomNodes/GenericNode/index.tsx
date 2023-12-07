import { cloneDeep } from "lodash";
import { useContext, useEffect, useState } from "react";
import { NodeResizer,NodeToolbar, Position, addEdge, useEdgesState, useReactFlow, useUpdateNodeInternals } from "reactflow";
import ShadTooltip from "../../components/ShadTooltipComponent";
import Tooltip from "../../components/TooltipComponent";
import IconComponent from "../../components/genericIconComponent";
import { useSSE } from "../../contexts/SSEContext";
import { TabsContext } from "../../contexts/tabsContext";
import { typesContext } from "../../contexts/typesContext";
import NodeToolbarComponent from "../../pages/FlowPage/components/nodeToolbarComponent";
import { NodeDataType } from "../../types/flow";
import { cleanEdges } from "../../utils/reactflowUtils";
import { nodeColors, nodeIconsLucide } from "../../utils/styleUtils";
import { checkArray, classNames, toTitleCase } from "../../utils/utils";
import ParameterComponent from "./components/parameterComponent";
import ToggleShadComponent from "../../components/toggleShadComponent";
import { time } from "console";
import AccordionComponent from "../../components/AccordionComponent";
import { getNextBG } from "../../pages/FlowPage/components/borderColorComponent";
import { undoRedoContext } from "../../contexts/undoRedoContext";

export default function GenericNode({
  data: olddata,
  selected,
}: {
  data: NodeDataType;
  selected: boolean;
}) {
  const [data, setData] = useState(olddata);
  const { updateFlow, flows, tabId,getNewEdgeId,getNodeId,isEMBuilt,tabsState  } = useContext(TabsContext);
  const updateNodeInternals = useUpdateNodeInternals();
  const { types, deleteNode, reactFlowInstances } = useContext(typesContext);
  const name = nodeIconsLucide[data.type] ? data.type : types[data.type];
  const [validationStatus, setValidationStatus] = useState(null);
  const flow=flows.find((flow)=>flow.id===tabId);

  const { takeSnapshot } = useContext(undoRedoContext);

  // State for outline color
  
  const [borderColor,setBorderColor] = useState(data.borderColor??"inherit");
  useEffect(()=>{
    let newData = cloneDeep(olddata);
    newData.borderColor=borderColor;
    newData.update_at=new Date();
    setData(newData);
  },[borderColor]);

  const { sseData, isBuilding } = useSSE();

  const [miniSize,setMiniSize] = useState(data.node.mini_size!=undefined&&data.node.mini_size);
  useEffect(()=>{
    let newData = cloneDeep(olddata);
    newData.node.mini_size=miniSize;
    newData.update_at=new Date();
    setData(newData);
  },[miniSize]);

  useEffect(() => {
    olddata.node = data.node;
    olddata.node.mini_size=miniSize;
    // olddata.update_at=new Date();
    olddata.borderColor=data.borderColor;
    let myFlow = flows.find((flow) => flow.id === tabId);
    
    if (reactFlowInstances.get(tabId) && myFlow) {
      // console.log("myFlow:",myFlow.data.viewport);
      let flow = cloneDeep(myFlow);
      if(myFlow.data){
        flow.data.viewport=myFlow.data.viewport; //for the bug of cloneDeep()

      }
      // console.log("after clone of myFlow:",flow.data.viewport);

      flow.data = reactFlowInstances.get(tabId).toObject();
      cleanEdges({
        flow: {
          edges: flow.data.edges,
          nodes: flow.data.nodes,
        },
        updateEdge: (edge) => {
          flow.data.edges = edge;
          reactFlowInstances.get(tabId).setEdges(edge);
          updateNodeInternals(data.id);
        },
      });
      reactFlowInstances.get(tabId).setNodes(flow.data.nodes);
      updateFlow(flow);
    }
  }, [data]);

  // New useEffect to watch for changes in sseData and update validation status
  useEffect(() => {
    const relevantData = sseData[data.id];
    if (relevantData) {
      // Extract validation information from relevantData and update the validationStatus state
      setValidationStatus(relevantData);
    } else {
      setValidationStatus(null);
    }
  }, [sseData, data.id]);

  // const handleOnNewValue = (newValue: boolean): void => {
  //   let newData = cloneDeep(olddata);
  //   newData.node.runnable=newValue;
  //   if(newValue != data.node.runnable){
  //     setData(newData);
  //   }
  // };
  const [runnabler,setRunnabler] = useState(data.node.runnable==undefined||data.node.runnable);
  useEffect(()=>{
    let newData = cloneDeep(olddata);
    newData.node.runnable=runnabler;
    newData.update_at=new Date();
    setData(newData);
  },[runnabler]);

  const { setCenter,fitView } = useReactFlow();
  function focusNode() {
    let flow = flows.find((flow) => flow.id === tabId);
    let node=flow.data?.nodes.find((node)=>node.id===data.id);
    if (!node) return;
    // const x = node.position.x + node.width / 2;
    // const y = node.position.y + node.height / 2;
    // setCenter(x, y, { zoom:0.8, duration: 1000 });
    fitView({nodes:[node],duration:1000,padding:0.6})
  }
  function refreshCurrentFlow(){
    let myFlow = flows.find((flow) => flow.id === tabId);
    if (reactFlowInstances.get(tabId) && myFlow) {
      let flow = cloneDeep(myFlow);
      flow.data = reactFlowInstances.get(tabId).toObject();
      reactFlowInstances.get(tabId).setNodes(flow.data.nodes);
      flow.data.viewport=myFlow.data.viewport; //for the bug of cloneDeep()
      updateFlow(flow);
    }
  }    
  
  useEffect(()=>{
    if(data.type=="Note"&&tabId&&reactFlowInstances.get(tabId)  &&
      tabsState[tabId+"-"+data.id] &&
      tabsState[tabId+"-"+data.id].formKeysData &&
      tabsState[tabId+"-"+data.id].formKeysData.input_keys!==null
      ){
      try {
        let value=data.node.template.note?.value;
        let currNode=reactFlowInstances.get(tabId).getNode(data.id);
        const jsonObject = JSON.parse(value);
        // let root=createNoteNode("JSON 对象",{x:currNode.position.x+700,y:currNode.position.y});
        takeSnapshot();
        // createNodeEdge(root.position.x+400*currZoom,root.position.y,"jsonObject",root.id);
        createNodesFromJson(currNode.position.x+currNode.width+100,currNode.position.y,jsonObject,currNode.id);        
      } catch (error) {
        // console.log("value is not Json:",data.node.template.note?.value);
      }
    }
  },[data]);
  
  function createNoteNode(newValue,newPosition,type?:string,borderColour?:string){
    if(!type){
      type="noteNode";
    }
    if(!newPosition){
      let currNode=flow.data.nodes.find((node)=>node.id===data.id);
      newPosition={x:currNode.position.x+400,y:currNode.position.y+20};
    }
    let newId = getNodeId(type);
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
    // let nodesList=flow.data.nodes;
    flow.data.nodes.push(newNode);
    // nodesList.push(newNode);
  
    reactFlowInstances.get(tabId).setNodes(flow.data.nodes);
    return newNode;
  }
  function createNodesFromJson(clientX,clientY,jsonObj,sourceId){
    let numX=1;
    let numY=0;
    let currZoom=1;//reactFlowInstances.get(tabId).getViewport().zoom;
    for (let key in jsonObj) {
        if (jsonObj[key] !== null && (typeof jsonObj[key] === "object") ) {
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
      let sourceNode=flow?.data?.nodes.find((n)=>n.id==sourceId);
      let newNode=createNoteNode(content, 
                {
                    x: clientX, 
                    y: clientY 
                },
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

      
      flow.data.edges.push(newEdeg);    
      reactFlowInstances.get(tabId).setEdges(flow.data.edges);

      if(!sourceNode.data.numOftarget)sourceNode.data.numOftarget=0;
      sourceNode.data.numOftarget+=1;
      return newNode.id;
  }

  return (
    <>
      <NodeToolbar offset={(data.type=="Note" || data.type=="AINote")?2:-5} position={(data.type=="Note" || data.type=="AINote")?Position.Bottom:Position.Top}>
        <NodeToolbarComponent
          data={data}
          setData={setData}
          deleteNode={deleteNode}
          runnabler={runnabler}
          setRunnabler={setRunnabler}
          miniSize={miniSize}
          setMiniSize={setMiniSize}
          setBorder={setBorderColor}
        ></NodeToolbarComponent>
      </NodeToolbar>

      <div
        className={classNames(
          selected ? "border-4 "+((data.type =="Note"||data.type =="AINote")?"":"border-ring") : "border-4",
          data.type =="Note"?"border-8 generic-resize-node-div"
          :data.type =="AINote"?"border-8 generic-resize-node-div"
          :" generic-node-div"
        )}
        onDoubleClick={(event)=>{
          event.stopPropagation();
          focusNode();
        }}
        style={{borderColor:data.borderColor}}

      >
      {(data.type=="Note" || data.type=="AINote") &&(
        <NodeResizer isVisible={selected} minWidth={300} minHeight={300} handleClassName="w-5 h-5"
                    onResizeEnd={(event)=>{
                      refreshCurrentFlow();
                    }}/>
      )}        
        {!(data.type=="Note" || data.type=="AINote") &&(
          <>
        {data.node.beta && (
          <div className="beta-badge-wrapper">
            <div className="beta-badge-content">BETA</div>
          </div>
        )}
        <div className="generic-node-div-title">
          <div className="generic-node-title-arrangement">
            <IconComponent
              name={name}
              className="generic-node-icon"
              iconColor={`${nodeColors[types[data.type]]}`}
            />
            <div className="generic-node-tooltip-div">
              <ShadTooltip content={data.node.display_name}>
                <div className="generic-node-tooltip-div text-primary">
                  {(data.node.display_name&&data.node.display_name=="PromptTemplate")?"全能指令":data.node.display_name}
                </div>
              </ShadTooltip>
            </div>
          </div>
          <div className="round-button-div">
            <Tooltip
               title={
                (!runnabler)?(
                    <span>Not Runnable</span>
                ):(
                    <span>Runnable</span>
                )}
            >
              <div className="mt-1">
                <ToggleShadComponent
                  disabled={false}
                  enabled={runnabler}
                  setEnabled={setRunnabler}
                  size="small"
                />
              </div>
            </Tooltip>
            <div>
              <Tooltip
                title={
                  isBuilding ? (
                    <span>Building...</span>
                  ) : !validationStatus ? (
                    <span className="flex">
                      Build{" "}
                      <IconComponent
                        name="Zap"
                        className="mx-0.5 h-5 fill-build-trigger stroke-build-trigger stroke-1"
                      />{" "}
                      flow to validate status.
                    </span>
                  ) : (
                    <div className="max-h-96 overflow-auto">
                      {typeof validationStatus.params === "string"
                        ? validationStatus.params
                            .split("\n")
                            .map((line, index) => <div key={index}>{line}</div>)
                        : ""}
                    </div>
                  )
                }
              >
                <div className="generic-node-status-position">
                  <div
                    className={classNames(
                      validationStatus && validationStatus.valid
                        ? "green-status"
                        : "status-build-animation",
                      "status-div"
                    )}
                  ></div>
                  <div
                    className={classNames(
                      validationStatus && !validationStatus.valid
                        ? "red-status"
                        : "status-build-animation",
                      "status-div"
                    )}
                  ></div>
                  <div
                    className={classNames(
                      !validationStatus || isBuilding
                        ? "yellow-status"
                        : "status-build-animation",
                      "status-div"
                    )}
                  ></div>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
        </>
        )}

        <div className={classNames(
          data.type == "Note"
          ?"generic-resize-node-desc"
          :data.type == "AINote"
          ?"generic-resize-2-node-desc":
          miniSize?"generic-node-desc relative":"generic-node-desc"
        )}
        >
          {(data.node.description!=="")?(
          <div className={
            miniSize?"hidden ":""+
            "generic-node-desc-text"
          }
          
          >
            {data.node.description}
          </div>
          ):(
            <></>
          )
          }

            {Object.keys(data.node.template)
              .filter((templateField) => templateField.charAt(0) !== "_")
              .map((templateField: string, idx) => (
                <div key={idx}>
                  {data.node.template[templateField].show &&
                  !data.node.template[templateField].advanced ? (
                    <ParameterComponent
                      key={
                        (data.node.template[templateField].input_types?.join(
                          ";"
                        ) ?? data.node.template[templateField].type) +
                        "|" +
                        templateField +
                        "|" +
                        data.id
                      }
                      data={data}
                      setData={setData}
                      color={
                        nodeColors[
                          types[data.node.template[templateField].type]
                        ] ??
                        nodeColors[data.node.template[templateField].type] ??
                        nodeColors.unknown
                      }
                      title={
                        data.node.template[templateField].display_name
                          ? data.node.template[templateField].display_name
                          : data.node.template[templateField].name
                          ? toTitleCase(data.node.template[templateField].name)
                          : toTitleCase(templateField)
                      }
                      info={data.node.template[templateField].info}
                      name={templateField}
                      tooltipTitle={
                        data.node.template[templateField].input_types?.join(
                          "\n"
                        ) ?? data.node.template[templateField].type
                      }
                      required={data.node.template[templateField].required}
                      id={
                        (data.node.template[templateField].input_types?.join(
                          ";"
                        ) ?? data.node.template[templateField].type) +
                        "|" +
                        templateField +
                        "|" +
                        data.id
                      }
                      left={true}
                      type={data.node.template[templateField].type}
                      optionalHandle={
                        data.node.template[templateField].input_types
                      }
                      nodeSelected={selected}
                    />
                    
                  ) : (
                    <></>
                  )}
                </div>
              ))}
              {(data.type=="Note"||data.type=="AINote")?(
                <></>
              ):(
                <div
                  className={classNames(
                    Object.keys(data.node.template).length < 1 ? "hidden" : "",
                    "flex-max-width justify-center"
                  )}
                >
                  {" "}
                </div>
              )}
            

            <ParameterComponent
              key={[data.type, data.id, ...data.node.base_classes].join("|")}
              data={data}
              setData={setData}
              color={nodeColors[types[data.type]] ?? nodeColors.unknown}
              title={
                data.node.output_types && data.node.output_types.length > 0
                  ? data.node.output_types.join("|")
                  : data.type
              }
              tooltipTitle={data.node.base_classes.join("\n")}
              id={[data.type, data.id, ...data.node.base_classes].join("|")}
              type={data.node.base_classes.join("|")}
              left={false}
            />
        </div>
      </div>
    </>
  );
}
