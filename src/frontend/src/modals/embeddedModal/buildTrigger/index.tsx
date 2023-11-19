import { useContext, useState } from "react";
import Loading from "../../../components/ui/loading";
import { useSSE } from "../../../contexts/SSEContext";
import { alertContext } from "../../../contexts/alertContext";
import { typesContext } from "../../../contexts/typesContext";
import { postBuildInit } from "../../../controllers/API";
import { FlowType, NodeType } from "../../../types/flow";

import { TabsContext } from "../../../contexts/tabsContext";
import { validateNodes } from "../../../utils/reactflowUtils";
import RadialProgressComponent from "../../../components/RadialProgress";
import IconComponent from "../../../components/genericIconComponent";
import ShadTooltip from "../../../components/ShadTooltipComponent";
import { classNames, enforceMinimumLoadingTime, toNormalCase } from "../../../utils/utils";
import { cloneDeep, functionsIn } from "lodash";

export default function BuildTrigger({
  flow,
  nodeId,
  setIsBuilt,
}: {
  flow: FlowType;
  nodeId:string;
  setIsBuilt: any;
}) {
  const { updateSSEData, isBuilding, setIsBuilding, sseData } = useSSE();
  const { reactFlowInstances } = useContext(typesContext);
  const { setTabsState,tabId } = useContext(TabsContext);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const [isIconTouched, setIsIconTouched] = useState(false);
  const eventClick = isBuilding ? "pointer-events-none" : "";
  const [progress, setProgress] = useState(0);

  function validateRelatedNodes(flow:FlowType){
    if (flow.data.nodes.length === 0) {
      return [
        "No nodes found in the flow. Please add at least one node to the flow.",
      ];
    }
    return flow.data.nodes
      .flatMap((n: NodeType) => validateRelatedNode(n, flow));

  }

  function validateRelatedNode(
    node: NodeType,
    flow: FlowType
  ): Array<string> {
    if(node.type!=="genericNode") return [];
    if (!node.data?.node?.template || !Object.keys(node.data.node.template)) {
      return [
        "We've noticed a potential issue with a node in the flow. Please review it and, if necessary, submit a bug report with your exported flow file. Thank you for your help!",
      ];
    }
  
    const {
      type,
      node: { template },
    } = node.data;
  
    return Object.keys(template).reduce(
      (errors: Array<string>, t) =>
        errors.concat(
          template[t].required &&
            template[t].show &&
            (template[t].value === undefined ||
              template[t].value === null ||
              template[t].value === "") &&
              (node.data?.node?.runnable===undefined||node.data?.node?.runnable)&&
            !flow.data.edges.some(
                (edge) =>
                  edge.targetHandle&&
                  edge.targetHandle.split("|")[1] === t &&
                  edge.targetHandle.split("|")[2] === node.id
                
              )
            ? [
                `${type} is missing ${
                  template.display_name || toNormalCase(template[t].name)
                }.`,
              ]
            : []
        ),
      [] as string[]
    );
  }

  async function handleBuild(flow: FlowType) {
    
    try {
      if (isBuilding) {
        return;
      }
      const errors = validateRelatedNodes(flow);
      if (errors.length > 0) {
        setErrorData({
          title: "Oops! Looks like you missed something",
          list: errors,
        });
        return;
      }
      const minimumLoadingTime = 200; // in milliseconds
      const startTime = Date.now();
      setIsBuilding(true);
      
      const allNodesValid = await streamNodeData(flow);
      await enforceMinimumLoadingTime(startTime, minimumLoadingTime);
      setIsBuilt(allNodesValid);
      if (!allNodesValid) {
        setErrorData({
          title: "Oops! Looks like you missed something",
          list: [
            "Check components and retry. Hover over component status icon 🔴 to inspect.",
          ],
        });
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
        setSuccessData({ title: parsedData.log });
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
        setProgress(parsedData.progress);
        validationResults.push(isValid);
      }
    };

    eventSource.onerror = (error: any) => {
      console.error("EventSource failed:", error);
      eventSource.close();
      if (error.data) {
        const parsedData = JSON.parse(error.data);
        setErrorData({ title: parsedData.error });
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

  // async function enforceMinimumLoadingTime(
  //   startTime: number,
  //   minimumLoadingTime: number
  // ) {
  //   const elapsedTime = Date.now() - startTime;
  //   const remainingTime = minimumLoadingTime - elapsedTime;

  //   if (remainingTime > 0) {
  //     return new Promise((resolve) => setTimeout(resolve, remainingTime));
  //   }
  // }

  const handleMouseEnter = () => {
    setIsIconTouched(true);
  };

  const handleMouseLeave = () => {
    setIsIconTouched(false);
  };

  /**
   * generate a new flow, which id will be changed, and edges & nodes will be filtered
   * @param flow 
   * @param node_id 
   * @returns newFlow
   */
  function newFlow(flow:FlowType,node_id:string){

    let newFlow=cloneDeep(flow);

    // 用于存储与给定节点相关的边的目标节点ID
    const relatedNodeIds = [];
    // console.log("node_id:",node_id);
    // console.log("flow:",flow);
    // 遍历数组edges，找出所有与给定节点相关的边
    flow.data.edges.forEach((edge) => {
      // console.log("edge:",edge);
      if (edge.target === node_id) {
        relatedNodeIds.push(edge.source);
      }
    });

    // 用于存储与给定节点相关联的节点ID
    const allRelatedNodeIds = new Set(relatedNodeIds);

    // 重复查找直到没有新的关联节点被找到
    let newRelatedNodeFound = true;
    while (newRelatedNodeFound) {
      newRelatedNodeFound = false;

      // 遍历数组edges，找出所有与已知关联节点相关的边
      flow.data.edges.forEach((edge) => {
        if (allRelatedNodeIds.has(edge.source) && !allRelatedNodeIds.has(edge.target)) {
          allRelatedNodeIds.add(edge.target);
          newRelatedNodeFound = true;
        }
        if (allRelatedNodeIds.has(edge.target) && !allRelatedNodeIds.has(edge.source)) {
          allRelatedNodeIds.add(edge.source);
          newRelatedNodeFound = true;
        }
      });
    }
    
    // 删除没有与给定节点相关的节点和边
    const filteredNodes = flow.data.nodes.filter((node) => allRelatedNodeIds.has(node.id));
    const filteredEdges = flow.data.edges.filter((edge) => allRelatedNodeIds.has(edge.source) && allRelatedNodeIds.has(edge.target));

    newFlow.id=flow.id+"-"+node_id;
    newFlow.data.edges=filteredEdges;
    newFlow.data.nodes=filteredNodes;
    // console.log("newFlow:",newFlow);
    // console.log("filteredNodes:",filteredNodes);
    // console.log("filteredEdges:",filteredEdges);
    return newFlow;
}
  return (
        <div
          className={`${eventClick} `}
          onClick={() => {
            handleBuild(newFlow(flow,nodeId));
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ShadTooltip content="执行" side="top">
          <button 
            className={classNames(
                  "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
            )}>
            <div className="round-button-div">
              {isBuilding && progress < 1 ? (
                // Render your loading animation here when isBuilding is true
                <RadialProgressComponent
                  // ! confirm below works
                  color={"text-build-trigger"}
                  value={progress}
                  size="1rem"
                ></RadialProgressComponent>
              ) : isBuilding ? (
                <Loading
                  strokeWidth={1.5}
                  className="build-trigger-loading-icon h-4 w-4"
                />
              ) : (
                <IconComponent
                  name="Play"
                  className="h-4 w-4 fill-build-trigger stroke-build-trigger stroke-1"
                />
              )}
            </div>
          </button>
          </ShadTooltip>
        </div>
  );
}
