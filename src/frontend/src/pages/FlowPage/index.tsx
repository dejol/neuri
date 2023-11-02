import { ReactNode, useContext, useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { TabsContext } from "../../contexts/tabsContext";
import { getVersion } from "../../controllers/API";
import Page from "./components/PageComponent";
import { Transition } from "@headlessui/react";
import FolderPopover from "./components/FolderComponent";
import NoteEditorModal from "../../modals/noteEditorModal";
import SearchListModal from "../../modals/searchListModal";


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
          <>{children}</>
      )}
    </div>
  );
}

export default function FlowPage() {
  const { flows, tabId, setTabId,setIsLogin,setLoginUserId,loginUserId,
    tabValues,openFolderList,notes,getSearchResult } = useContext(TabsContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [openSearch,setOpenSearch]=useState(false);
  useEffect(() => {
    // if(getSearchResult&&(getSearchResult.flows.length>0||getSearchResult.notes.length>0)){
      setOpenSearch(true);
    // }
  },[getSearchResult]);
  // Set flow tab id
  useEffect(() => {
    if(localStorage.getItem('login')){
      setIsLogin(true);
      setLoginUserId(localStorage.getItem('login'));
    }else{
      navigate("/");
    }
    if(flows){
      let flow=flows.find((flow) => flow.id === id);
      if(flow&&flow.user_id!=loginUserId){
        navigate("/");
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
          <div className="flex h-full overflow-hidden">
            <FolderPopover />
          </div>
          
        </Transition>
        <Transition
            show={openSearch}
            enter="transition-transform duration-500 ease-out"
            enterFrom={"transform translate-x-[-100%]"}
            enterTo={"transform translate-x-0"}
            leave="transition-transform duration-500 ease-in"
            leaveFrom={"transform translate-x-0"}
            leaveTo={"transform translate-x-[-100%]"}
            // className={"chat-message-modal-thought-cursor"}

          >
            <div className="flex h-full overflow-hidden">
              <div className="search-list-bar-arrangement">
              <SearchListModal
                open={openSearch}
                setOpen={setOpenSearch}
                flowList={getSearchResult.flows}
                noteList={getSearchResult.notes}
                searchKeyword={getSearchResult.keyword}
                folderId={getSearchResult.folderId}
              />
            </div>
          </div>
        </Transition>        

      
        <TabPanel value={tabId} index={""}>    
          <div className="flex w-full h-full" style={{alignItems:"center"}}>
            <img src="/welcome.jpg"/>
            </div>
        </TabPanel>       
        {Array.from(tabValues.values()).map((value,key)=>{
          return(
            <TabPanel value={tabId} index={value.id}>    
            {value.type=="flow"?(
              <>
              {flows.length > 0 && tabId !== "" &&
              flows.findIndex((flow) => flow.id === tabId) !== -1 && (
                <Page flow={flows.find((flow) => flow.id === tabId)} />
              )
              }
              </>
            ):(
              <>
              {value.type=="note"&&(
              <NoteEditorModal
               note_id={value.id}
               title={value.id.startsWith("NewNote")?"":(notes.find((note)=>note.id===value.id)).name}
               content={value.id.startsWith("NewNote")?"":(notes.find((note)=>note.id===value.id)).content.value}
              />
              )}
              </>

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
