import { useContext, useEffect, useRef, useState } from "react";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { alertContext } from "../../contexts/alertContext";
import { TabsContext } from "../../contexts/tabsContext";
import BaseModal from "../baseModal";
import { Label } from "../../components/ui/label";
import { FolderType } from "../../types/flow";
import { useNavigate } from "react-router-dom";
import { ConfirmDialogModal } from "../confirmModal";

export default function FolderModal({
  open,
  setOpen,
  isNew = false,
  // popoverStatus,
  // setPopoverStatus,
  folderId,
  folders,
  parentId,
}: {
  folderId?:string;
  isNew?:boolean;
  open: boolean;
  // popoverStatus:boolean;
  setOpen: (open: boolean) => void;
  // setPopoverStatus:(popoverStatus:boolean)=> void;
  folders: Array<FolderType>;
  parentId?:string;
}) {
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const ref = useRef();
  const { flows, notes,tabId, updateFlow, setTabsState, saveFlow,addFolder,saveFolder,removeFolder } =
    useContext(TabsContext);
  const maxLength = 50;
  const navigate = useNavigate();


  const [name, setName] = useState(
      isNew?"":folders.find((folder) => folder.id === folderId)?(folders.find((folder) => folder.id === folderId).name):""
  );
  // const [folderId, setFolderId] = useState(
  //   isNew?"":(flows.find((flow) => flow.id === tabId).folder_id)
  // );

  const [description, setDescription] = useState(
    isNew?"":folders.find((folder) => folder.id === folderId)?(folders.find((folder) => folder.id === folderId).description):""
  );
  useEffect(()=>{
    if(!isNew){
      setName(folders.find((folder) => folder.id === folderId).name);
      setDescription(folders.find((folder) => folder.id === folderId).description);
    }else{
      setName("");
      setDescription("");
    }

  },[folderId,isNew]);

  const [invalidName, setInvalidName] = useState(false);
  function handleClick() {
    if(isNew){
      addFolder({id:"",parent_id:parentId,name:name,description:description}).then((id) => {
        // setPopoverStatus(true);
        setSuccessData({ title: "New Folder is created" });
      });
      
      
    }else{
      let savedFolder = folders.find((folder) => folder.id === folderId);
      savedFolder.name = name;
      savedFolder.description = description;
      saveFolder(savedFolder);
      // console.log("save folder:%s:%s",name,description);
      
      setSuccessData({ title: "Folder saved successfully" });
    }
    setName("");
    setDescription("");
    setOpen(false);
  }

  const [openConfirm,setOpenConfirm] = useState(false);


  return (
    <>
    <BaseModal open={open} setOpen={setOpen} size="small">
      <BaseModal.Header description="文件夹详情">
        {isNew?(
          <span className="pr-2">创建新的文件夹</span>
        ):(
          <span className="pr-2">编辑</span>
        )}
        <IconComponent name="Folder" className="mr-2 h-4 w-4 " />
      </BaseModal.Header>
      <BaseModal.Content>
          <EditFlowSettings
          invalidName={invalidName}
          setInvalidName={setInvalidName}
          name={name}
          description={description}
          flows={flows}//never use insize
          tabId={tabId}//never use insize
          setName={setName}
          setDescription={setDescription}
          updateFlow={updateFlow}//never use insize
        />
      </BaseModal.Content>

      <BaseModal.Footer>
        <Button disabled={invalidName} onClick={handleClick} type="submit">
          保存
        </Button>
        {!isNew&&(
          <Button onClick={()=>{
              setOpen(false);
              setOpenConfirm(true);
            }} type="button" className="mx-2" variant={"secondary"}>
              <IconComponent name="Trash2" className="h-4 w-4 mr-2" />
            删除
          </Button>  
        )}        
      </BaseModal.Footer>
    </BaseModal>
      <ConfirmDialogModal
        title="确认操作"
        content="删除操作是不可恢复的，确认是否继续？"
        confirm={()=>{
          let index = flows.findIndex((flow) => flow.folder_id === folderId);
          let indexFolder = folders.findIndex((folder) => folder.parent_id === folderId);
          let indexNote = notes.findIndex((note) => note.folder_id === folderId);
          if (index >= 0||indexFolder>=0||indexNote>=0) {
            setErrorData({title:"删除操作失败，可能有白板/笔记/文件夹在本文件夹下面，请检查。 "});
          }else{
            removeFolder(folderId);
            setName("");
            setDescription("");
            setSuccessData({ title: "删除文件夹成功" })
          }          
          setOpenConfirm(false);
        }}
        open={openConfirm}
        setOpen={setOpenConfirm}
      />
  </>
  );
}
