import { useContext, useEffect, useRef, useState } from "react";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { SETTINGS_DIALOG_SUBTITLE } from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { TabsContext } from "../../contexts/tabsContext";
import BaseModal from "../baseModal";
import { DropdownMenu,DropdownMenuTrigger, DropdownMenuItem,DropdownMenuContent} from "../../components/ui/dropdown-menu";
import { Label } from "../../components/ui/label";
import { useNavigate } from "react-router-dom";
import Dropdown from "../../components/dropdownComponent";
import { cloneDeep, flow } from "lodash";
import { ConfirmDialogModal } from "../confirmModal";


export default function FlowSettingsModal({
  open,
  setOpen,
  isNew = false,
  newFolderId="",
}: {
  newFolderId?:string;
  isNew?:boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const ref = useRef();
  const { flows, tabId,updateFlow, setTabsState, saveFlow,folders,addFlow,removeFlow,setTabValues,setTabId,tabValues } =
    useContext(TabsContext);
  const maxLength = 50;
  
  const [name, setName] = useState("");
  const [folderId, setFolderId] = useState("");

  const [description, setDescription] = useState(
    isNew?"":(flows.find((flow) => flow.id === tabId)?flows.find((flow) => flow.id === tabId).description:"")
  );
  const [invalidName, setInvalidName] = useState(false);
  const navigate = useNavigate();
  const [openConfirm,setOpenConfirm] = useState(false);

  function handleSave() {

    if(isNew){
      if(!folderId){
        addFlow({"name":name,"description":description,"id":"","data":null,"folder_id":newFolderId},true,newFolderId)
        .then((id) => {
          //  navigate("/flow/" + id);
          //  let newValues=cloneDeep(tabValues);
          //  newValues.push(id.toString());
          //  setTabValues(newValues);
          tabValues.set(id.toString(),{id:id.toString(),type:"flow"})
          setTabId(id.toString());
          setSuccessData({ title: "New notebook successfully"});
       });
      }else{
        addFlow({"name":name,"description":description,"id":"","data":null,"folder_id":folderId},true,folderId)
        .then((id) => {
          //  navigate("/flow/" + id);
          // let newValues=cloneDeep(tabValues);
          // newValues.push(id.toString());
          // setTabValues(newValues);
          tabValues.set(id.toString(),{id:id.toString(),type:"flow"})
          setTabId(id.toString());
          setSuccessData({ title: "创建白板成功" });

       });
      }
    }else{
      let savedFlow = flows.find((flow) => flow.id === tabId);
      savedFlow.name = name;
      savedFlow.description = description;
      savedFlow.folder_id = folderId;
      saveFlow(savedFlow);
      setSuccessData({ title: "白板数据保存成功" });
    }
    setOpen(false);
  }

  useEffect(()=>{
    if(newFolderId!=""){
      setFolderId(newFolderId);
    }
  },[newFolderId])
  useEffect(()=>{
    if(!isNew){
      let flow=flows.find((flow) => flow.id === tabId);
      if(flow){
        setName(flow.name);
        setDescription(flow.description);
        setFolderId(flow.folder_id);
      }
    }
  },[tabId])

  function listSubFolders(parentId:string){
    return(
      folders.filter((folderItem)=>folderItem.parent_id==parentId)
        .map((folder, idx) => (
        <div className={!parentId?"":"ml-3"} key={idx}>
          <DropdownMenuItem
            onClick={() => {
              setFolderId(folder.id);
            }}
            className="cursor-pointer"
            key={idx}
            >
            <div className={"file-component-badge-div justify-start "}>
            <IconComponent name="Folder" className="main-page-nav-button" />
            {folder.name}
            </div>
          </DropdownMenuItem>
          {listSubFolders(folder.id)}
        </div>
      ))
    )
  }

  return (
    <>
    <BaseModal open={open} setOpen={setOpen} size="medium">
      <BaseModal.Header description={SETTINGS_DIALOG_SUBTITLE}>
        {isNew?(
          <span className="pr-2">新的白板</span>
        ):(
          <span className="pr-2">设置</span>
        )}
        <IconComponent name={isNew?"File":"Settings2"} className="mr-2 h-4 w-4 " />
      </BaseModal.Header>
      <BaseModal.Content>
      <Label>
        <div className="edit-flow-arrangement">
          <span className="font-medium">文件夹:</span>{" "}
        </div>
        <div className="mb-2 mt-2">
        <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button asChild variant="primary" size="sm">
                  <div className="header-menu-bar-display">
                  <IconComponent name="Folder" className="main-page-nav-button" />
                    <div className="header-menu-flow-name">
                    {folders&&folders.map((folder,idx) => (
                      (folder.id==folderId)&&(
                        <div key={idx}>{folder.name}</div>
                      )
                    ))}
                    {!folderId&&(
                      <div key="unclass">暂未分类</div>
                    )}
                    </div>
                    <IconComponent name="ChevronDown" className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-50">
                {listSubFolders("")}
                <DropdownMenuItem
                onClick={() => {
                  setFolderId("");
                }}
                className="cursor-pointer"
                >
                  <div className={"file-component-badge-div justify-start "}>
                    <IconComponent name="Folder" className="main-page-nav-button" />
                    暂未分类
                  </div>                  
                  </DropdownMenuItem>                
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
      </Label>
          <EditFlowSettings
          invalidName={invalidName}
          setInvalidName={setInvalidName}
          name={name}
          description={description}
          flows={flows}
          tabId={tabId}
          setName={setName}
          setDescription={setDescription}
          updateFlow={updateFlow}
        />
      </BaseModal.Content>

      <BaseModal.Footer>
        <Button  onClick={handleSave} type="submit">
          保存设置
        </Button>
        {(!isNew)&&(
          <Button  onClick={()=>{
              setOpenConfirm(true);
              setOpen(false);
            }} type="button" className="mx-2" variant={"secondary"}>
              <IconComponent name="Trash2" className="h-4 w-4 mr-2" />
            删除白板
          </Button>  
        )}
       
      </BaseModal.Footer>
    </BaseModal>
    <ConfirmDialogModal
      title="确认"
      content="本次操作是不可恢复的，是否确认要做?"
      confirm={()=>{
        let flow=flows.find((flow) => flow.id === tabId);
        removeFlow(flow.id);
        setSuccessData({ title: "删除白板成功" });
        setOpen(false);
        setDescription("");
        setName("");
        tabValues.delete(flow.id);
        setTabId("");
      }}
      open={openConfirm}
      setOpen={setOpenConfirm}
    />
    </>
  );
}
