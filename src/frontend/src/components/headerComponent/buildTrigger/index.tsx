import { Transition } from "@headlessui/react";
import { useContext, useState } from "react";
import Loading from "../../../components/ui/loading";
import { useSSE } from "../../../contexts/SSEContext";
import { alertContext } from "../../../contexts/alertContext";
import { typesContext } from "../../../contexts/typesContext";
import { postBuildInit } from "../../../controllers/API";
import { FlowType } from "../../../types/flow";

import { TabsContext } from "../../../contexts/tabsContext";
import { validateNodes } from "../../../utils/reactflowUtils";
import RadialProgressComponent from "../../RadialProgress";
import IconComponent from "../../genericIconComponent";
import { enforceMinimumLoadingTime } from "../../../utils/utils";
import ShadTooltip from "../../ShadTooltipComponent";
import { cloneDeep } from "lodash";

export default function BuildTrigger({
  // open,
  // setOpen,
  flow,
  setIsBuilt,
}: {
  // open: boolean;
  // setOpen: (open: boolean) => void;
  flow: FlowType;
  setIsBuilt: any;
  isBuilt: boolean;
}) {
  const { updateSSEData, isBuilding, setIsBuilding, sseData } = useSSE();
  const { reactFlowInstances } = useContext(typesContext);
  const { setTabsState,tabId,flows } = useContext(TabsContext);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const [isIconTouched, setIsIconTouched] = useState(false);
  const eventClick = isBuilding ? "pointer-events-none" : "";
  const [progress, setProgress] = useState(0);

  async function handleBuild(sourceFlow: FlowType) {
    let flow=newFlow(sourceFlow);
    try {
      if (isBuilding) {
        return;
      }
      
      const errors = validateNodes(reactFlowInstances.get(tabId));
      if (errors.length > 0) {
        let flow = flows.find((flow)=>flow.id==tabId);
        setErrorData({
          title: `哦！看来运行'${flow.name}'有些异常情况`,
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
        let flow = flows.find((flow)=>flow.id==tabId);

        setErrorData({
          title: `哦！'${flow.name}'遇到问题了`,
          list: [
            "请检查节点让尝试，特别留意图标是 🔴 的.",
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
      // console.log("%d:%d/%d",validationResults.length,lengthOfRunnable,flow.data.nodes.length);
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
/**
   * generate a new flow, which id will be changed, and edges & nodes will be filtered
   * @param flow 
   * @returns newFlow
   */
  function newFlow(flow:FlowType){
    let newFlow=cloneDeep(flow);
    const removeNodeIds = [];
    // console.log("flow:",flow);
    // 遍历数组edges，找出不需要运行的节点
    flow.data.edges.forEach((edge) => {
      // console.log("edge:",edge);
      if (edge.id.startsWith("finalEdge-")) {
        removeNodeIds.push(edge.target);
      }
    });

    const runEdgs=flow.data.edges.filter((edge) => edge.id.startsWith("reactflow__edge-"));

    // 用于存储与给定节点相关联的节点ID
    const allRemovedNodeIds = new Set(removeNodeIds);

    
    // 删除没有与给定节点相关的节点和边
    let filteredNodes = flow.data.nodes.filter((node) => !allRemovedNodeIds.has(node.id));
    filteredNodes = filteredNodes.filter((node) => (node.type=="genericNode"));  //只保留可运行的节点
    newFlow.data.edges=runEdgs;
    newFlow.data.nodes=filteredNodes;
    // console.log("newFlow:",newFlow);
    // console.log("filteredNodes:",filteredNodes);
    // console.log("filteredEdges:",filteredEdges);
    return newFlow;
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

  return (

        <div
          className={`${eventClick}`}
          onClick={() => {
            handleBuild(flow);
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ShadTooltip content="运行白板" side="bottom">
          <button className="extra-side-bar-buttons">
            <div className="round-button-div">
              {isBuilding && progress < 1 ? (
                // Render your loading animation here when isBuilding is true
                <RadialProgressComponent
                  // ! confirm below works
                  color={"text-build-trigger"}
                  value={progress}
                ></RadialProgressComponent>
              ) : isBuilding ? (
                <Loading
                  strokeWidth={1.5}
                  className="h-5 w-5 build-trigger-loading-icon"
                />
              ) : (
                <IconComponent
                  name="Zap"
                  className="h-5 w-5 fill-build-trigger stroke-build-trigger stroke-1"
                />
              )}
            </div>
          </button>
          </ShadTooltip>
        </div>
  );
}
