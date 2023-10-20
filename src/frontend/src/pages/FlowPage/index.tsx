import { ReactNode, useContext, useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { TabsContext } from "../../contexts/tabsContext";
import { getVersion } from "../../controllers/API";
import Page from "./components/PageComponent";
import WebEditorModal from "../../modals/webEditorModal";
import { Transition } from "@headlessui/react";
import FolderPopover from "./components/FolderComponent";
import { cloneDeep } from "lodash";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import NoteEditorModal from "../../modals/noteEditorModal";


interface TabPanelProps {
  children?: ReactNode;
  index: string;
  value: string;
}

function CustomTabPanel(props: TabPanelProps) {
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
  const { flows, tabId, setTabId,isLogin,setIsLogin,setLoginUserId,loginUserId,
    setEditFlowId,setEditNodeId,editFlowId,editNodeId,openWebEditor,setOpenWebEditor,
    tabValues,openFolderList,setTabValues,notes } = useContext(TabsContext);
  const { id } = useParams();
  const navigate = useNavigate();

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
      // let newValues=cloneDeep(tabValues);
      // let exiting=newValues.find((item)=>item===id);
      // if(!exiting){
      //   newValues.push(id);
      //   setTabValues(newValues);
      // }
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
      {flows.length > 0 &&(
          <Transition
          show={openFolderList}
          enter="transition-transform duration-500 ease-out"
          enterFrom={"transform translate-x-[-100%]"}
          enterTo={"transform translate-x-0"}
          leave="transition-transform duration-500 ease-in"
          leaveFrom={"transform translate-x-0"}
          leaveTo={"transform translate-x-[-100%]"}
          className={"chat-message-modal-thought-cursor"}
        >
          <div className="flex h-full overflow-hidden">
          <FolderPopover />
          </div>
        </Transition>
       
        )}
        <CustomTabPanel value={tabId} index={""}>    
          <div className="flex w-full h-full" style={{alignItems:"center"}}>
            <img src="/welcome.jpg"/>
            </div>
        </CustomTabPanel>       
        {Array.from(tabValues.values()).map((value,key)=>{
          return(
            <CustomTabPanel value={tabId} index={value.id}>    
            {value.type=="flow"?(
              <>
              {flows.length > 0 && tabId !== "" &&
              flows.findIndex((flow) => flow.id === tabId) !== -1 && (
                <Page flow={flows.find((flow) => flow.id === tabId)} />
              )
              }
              </>
            ):(
              <NoteEditorModal
               note_id={value.id}
               title={value.id.startsWith("NewNote")?"":(notes.find((note)=>note.id===value.id)).name}
               content={value.id.startsWith("NewNote")?"":(notes.find((note)=>note.id===value.id)).content.value}
              />
            )}


            </CustomTabPanel> 
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
      {/* <WebEditorModal
        setOpen={setOpenWebEditor}
        open={openWebEditor}
        flow_id={editFlowId}
        node_id={editNodeId}
      ></WebEditorModal> */}
    </div>
  );
}
