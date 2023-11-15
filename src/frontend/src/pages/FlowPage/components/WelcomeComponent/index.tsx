import {  useContext, useEffect, useRef, useState } from "react";
import Chat from "../../../../components/chatComponent";
import { locationContext } from "../../../../contexts/locationContext";
import { TabsContext } from "../../../../contexts/tabsContext";
import { FlowType } from "../../../../types/flow";
import {  getAssistantFlow, enforceMinimumLoadingTime} from "../../../../utils/utils";
import LeftFormModal from "../../../../modals/leftFormModal";
import { Transition } from "@headlessui/react";
import { postBuildInit, postNotesAssistant } from "../../../../controllers/API";
import { darkContext } from "../../../../contexts/darkContext";
import { useSSE } from "../../../../contexts/SSEContext";
import FolderPopover from "../FolderComponent";
import SearchListModal from "../../../../modals/searchListModal";


export default function Welcome({ flow }: { flow: FlowType }) {
  let {tabsState,setTabsState,tabId,getSearchResult} = useContext(TabsContext);

  const { dark } = useContext(darkContext);
  const reactFlowWrapper = useRef(null);
  const { updateSSEData, isBuilding, setIsBuilding } = useSSE();
  const [open,setOpen]=useState(false);
  const [canOpen, setCanOpen] = useState(false);
  const { setIsBuilt} = useContext(TabsContext);
  const {openAssistant,openFolderList,openSearchList ,setOpenSearchList,screenWidth} = useContext(locationContext);    
  const assistantOn = useRef(false);

  useEffect(()=>{
    assistantOn.current=openAssistant;
    if(assistantOn.current){
      handleBuild(getAssistantFlow(flow.id,"Neuri 是一个AI网络笔记系统"));
    }
  },[openAssistant,flow.id]);

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
    while (!finished) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      finished = validationResults.length === flow.data.nodes.length;
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
      <main className="flex flex-1">
        {/* Primary column */}
          <div className="h-full w-full">
              <div className="h-full w-full" ref={reactFlowWrapper}>
                <div className={"h-full w-full"}>
                  <div className="w-full h-full">
                    <img src="/welcome.jpg" className="" />
                  </div>
                  {tabId==""&&(
                    <div >
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
                      <div className="fixed top-12 left-0 h-[93%]">
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
                          <div className="fixed top-12 left-[13rem] h-[93%]">
                            <div className="search-list-bar-arrangement">
                              <SearchListModal
                                open={openSearchList}
                                setOpen={setOpenSearchList}
                                flowList={getSearchResult.flows}
                                noteList={getSearchResult.notes}
                                searchKeyword={getSearchResult.keyword}
                                folderId={getSearchResult.folderId}
                              />
                            </div>
                          </div>
                        </Transition> 
                        </div>
                  )}
    
                    <Chat open={open} setOpen={setOpen} isBuilt={true} setIsBuilt={setIsBuilt} canOpen={openAssistant} setCanOpen={setCanOpen} flow={flow}/>
                    {tabsState[flow.id] &&
                      tabsState[flow.id].formKeysData && 
                       openAssistant&&(
                        <Transition
                        show={open}
                        // appear={true}
                        // enter="transition-transform duration-500 ease-out"
                        // enterFrom={"transform translate-x-[-100%]"}
                        // enterTo={"transform translate-x-0"}
                        leave="transition-transform duration-500 ease-in"
                        leaveFrom={"transform translate-x-0"}
                        leaveTo={"transform translate-x-[-100%]"}
                        // className={"chat-message-modal-thought-cursor"}

                      > 
                      <div className="fixed bottom-12 left-2">   
                        <div className={"left-side-bar-arrangement"+(screenWidth<=1024?" w-[25rem]":"")}>     
                        <LeftFormModal
                          key={flow.id}
                          flow={flow}
                          open={open}
                          setOpen={setOpen}
                          needCheckFlow={false}
                        />
                        </div>   
                      </div>
                      </Transition>
                      )}
                      
                  </div> 
              </div>
            
          </div>
      </main>
     </div>
  );
}
