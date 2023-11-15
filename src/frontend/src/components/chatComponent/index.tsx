import { useContext, useEffect, useRef, useState } from "react";
import { useNodes } from "reactflow";
import { ChatType } from "../../types/chat";
import { FlowType } from "../../types/flow";
import BuildTrigger from "./buildTrigger";
import ChatTrigger from "./chatTrigger";

import * as _ from "lodash";
import { TabsContext } from "../../contexts/tabsContext";
import { getBuildStatus } from "../../controllers/API";
import { NodeType } from "../../types/flow";

export default function Chat({open,setOpen,isBuilt, setIsBuilt,canOpen,setCanOpen, flow }: {
  open:boolean;
  setOpen: (open: boolean) => void;
  isBuilt:boolean;
  setIsBuilt: (open: boolean) => void;
  canOpen:boolean;
  setCanOpen: (open: boolean) => void;
  flow:FlowType;
}) {
  // const [open, setOpen] = useState(false);
  // const [canOpen, setCanOpen] = useState(false);
  // const { tabsState, isBuilt, setIsBuilt } = useContext(TabsContext);
  const { tabsState } = useContext(TabsContext);

  // check is there has AINote 
  // let isAINote:boolean=false;
  // if (!flow.data || !flow.data.nodes) return;
  //   flow.data.nodes.forEach((node: NodeType) => {
  //     if(node.data.type=="AINote"&&(node.data.node.runnable==undefined||node.data.node.runnable)){
  //       isAINote=true;
  //       return;
  //     }
  // });  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "K" || event.key === "k") &&
        (event.metaKey || event.ctrlKey) &&
        isBuilt
      ) {
        event.preventDefault();
        setOpen((oldState) => !oldState);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };

  }, [isBuilt]);

  useEffect(() => {
    // Define an async function within the useEffect hook
    const fetchBuildStatus = async () => {
      const response = await getBuildStatus(flow.id);
      setIsBuilt(response.built);
    };
    // console.log("call the async funtion");
    // Call the async function
    fetchBuildStatus();
  }, [flow]);

  const prevNodesRef = useRef<any[] | undefined>();
  const nodes = useNodes();
  useEffect(() => {
    const prevNodes = prevNodesRef.current;
    const currentNodes = nodes.map((node: NodeType) =>
      _.cloneDeep(node.data.node?.template)
    );
    if (
      tabsState &&
      tabsState[flow.id] &&
      tabsState[flow.id].isPending &&
      JSON.stringify(prevNodes) !== JSON.stringify(currentNodes)
    ) {
      setIsBuilt(false);
    }
    if (
      tabsState &&
      tabsState[flow.id] &&
      tabsState[flow.id].formKeysData &&
      tabsState[flow.id].formKeysData.input_keys !== null
    ) {
      setCanOpen(true);
    } else {
      setCanOpen(false);
    }

    prevNodesRef.current = currentNodes;
  }, [tabsState, flow.id]);
  // console.log("result:",open,canOpen,isBuilt);
  return (
    <>
      <div>
        {/* <BuildTrigger
          open={open}
          setOpen={setOpen}
          flow={flow}
          setIsBuilt={setIsBuilt}
          isBuilt={isBuilt}
        /> */}
        {/* {isBuilt &&
          tabsState[flow.id] &&
          tabsState[flow.id].formKeysData &&
          // !isAINote && 
          canOpen && (
            <FormModal
              key={flow.id}
              flow={flow}
              open={open}
              setOpen={setOpen}
            />
          )} */}
        <ChatTrigger
          canOpen={canOpen}
          open={open}
          setOpen={setOpen}
          isBuilt={isBuilt}
        /> 

      </div>
    </>
  );
}
