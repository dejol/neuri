import { ReactNode, useContext, useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { TabsContext } from "../../contexts/tabsContext";
import { getVersion } from "../../controllers/API";
import Page from "./components/PageComponent";
import { Transition } from "@headlessui/react";
import FolderPopover from "./components/FolderComponent";
import NoteEditorModal from "../../modals/noteEditorModal";
import SearchListModal from "../../modals/searchListModal";
import { AuthContext } from "../../contexts/authContext";
import { locationContext } from "../../contexts/locationContext";
import Chat from "../../components/chatComponent";
import { useSSE } from "../../contexts/SSEContext";
import { FlowType } from "../../types/flow";
import { enforceMinimumLoadingTime,getAssistantFlow } from "../../utils/utils";
import { postBuildInit, postNotesAssistant } from "../../controllers/API";
import LeftFormModal from "../../modals/leftFormModal";
import Welcome from "./components/WelcomeComponent";
import React from "react";

interface TabPanelProps {
  children?: ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value != index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className="h-full w-full"
    >
      {value === index && (
          <React.Fragment key={index}>{children}</React.Fragment>
      )}
    </div>
  );
}

export default function FlowPage() {
  const { flows, tabId, setTabId,setTabsState,tabsState,
    tabValues,notes,getSearchResult,isBuilt,setIsBuilt } = useContext(TabsContext);
  const {openFolderList,openSearchList,setOpenSearchList,openAssistant} = useContext(locationContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const {userData} = useContext(AuthContext);
  const [open,setOpen] = useState(true);
  const [canOpen,setCanOpen] = useState(true);
  const {  isBuilding, setIsBuilding,updateSSEData } = useSSE();
  
  // useEffect(() => {
    // if(getSearchResult&&(getSearchResult.flows.length>0||getSearchResult.notes.length>0)){
      // setOpenSearchList(true);
    // }
  // },[getSearchResult.folderId,getSearchResult.keyword]);
  // Set flow tab id
  useEffect(() => {
    // if(userData && userData.id){
    //   setLoginUserId(userData.id);
    // }
    // else{
    //   navigate("/");
    // }

    if(flows){
      let flow=flows.find((flow) => flow.id === id);
      if(flow&&userData&&flow.user_id!=userData.id){
        navigate("/login");
      }
    }
    if(!id){
      setTabId("");
    }else{
      tabValues.set(id,{id:id,type:"flow",viewport:null});
      setTabId(id);
    }
  }, [id]);

  // Initialize state variable for the version
  // const [version, setVersion] = useState("");
  // useEffect(() => {
    // getVersion().then((data) => {
    //   setVersion(data.version);
    // });
  // }, []);

  return (
    <div className="flow-page-positioning flex">
    {(tabValues.get(tabId)&&tabValues.get(tabId).type=="note")&&(
      <>
        <Transition
          show={openFolderList}
          enter="transition-transform duration-500 ease-out"
          enterFrom={"transform translate-x-[-100%]"}
          enterTo={"transform translate-x-0"}
          leave="transition-transform duration-500 ease-in"
          leaveFrom={"transform translate-x-0"}
          leaveTo={"transform translate-x-[-100%]"}
          // className={"chat-message-modal-thought-cursor"}
        >
          <div className="flex h-full overflow-hidden ">
            <FolderPopover />
          </div>
          
        </Transition>
        <Transition
            show={openSearchList}
            enter="transition-transform duration-500 ease-out"
            enterFrom={"transform translate-x-[-100%]"}
            enterTo={"transform translate-x-200"}
            leave="transition-transform duration-500 ease-in"
            leaveFrom={"transform translate-x-200"}
            leaveTo={"transform translate-x-[-100%]"}
            // className={"chat-message-modal-thought-cursor"}

          >
            <div className="flex h-full overflow-hidden">
              
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
        </>    
      )}
      
        <TabPanel value={tabId} index={""}>
          {userData&&(
            <Welcome flow={{id:userData.id,name:"welcome",description:"",data:null}} />
          )}
        </TabPanel>       
        {Array.from(tabValues.values()).map((value,key)=>{
          return(
            <TabPanel value={tabId} index={value.id}>    
            {value.type=="flow"?(
              <React.Fragment key={key}>
              {flows.length > 0 && tabId !== "" &&
                flows.findIndex((flow) => flow.id === tabId) !== -1 && (
                  <Page flow={flows.find((flow) => flow.id === tabId)} />
                )
              }
              </React.Fragment>
            ):(
              <React.Fragment key={key}>
              {value.type=="note"&&(
              <NoteEditorModal
               note_id={value.id}
               title={value.id.startsWith("NewNote")?"":(notes.find((note)=>note.id===value.id)).name}
               content={value.id.startsWith("NewNote")?"":(notes.find((note)=>note.id===value.id)).content.value}
              />
              )}
              </React.Fragment>

            )}


            </TabPanel> 
          )
                                     
         })}


   
      {/* <a
        target={"_blank"}
        href="https://neuri.ai/"
        className="logspace-page-icon"
      >
        {version && <div className="mt-1"> Neuri v{version}</div>}
        <div className={version ? "mt-2" : "mt-1"}>Created by King Yu</div>
      </a> */}
    </div>
  );
}
