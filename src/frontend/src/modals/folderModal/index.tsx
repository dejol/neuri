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

export default function FolderModal({
  open,
  setOpen,
  isNew = false,
  popoverStatus,
  setPopoverStatus,
  folderId,
  folders,
}: {
  folderId?:string;
  isNew?:boolean;
  open: boolean;
  popoverStatus:boolean;
  setOpen: (open: boolean) => void;
  setPopoverStatus:(popoverStatus:boolean)=> void;
  folders: Array<FolderType>;
}) {
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const ref = useRef();
  const { flows, tabId,loginUserId, updateFlow, setTabsState, saveFlow,addFolder,saveFolder,removeFolder } =
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
      addFolder({"id":"","name":name,"description":description}).then((id) => {
        setPopoverStatus(true);
      });
      
      setSuccessData({ title: "New Folder is created" });
    }else{
      let savedFolder = folders.find((folder) => folder.id === folderId);
      savedFolder.name = name;
      savedFolder.description = description;
      saveFolder(savedFolder);
      // console.log("save folder:%s:%s",name,description);
      
      setSuccessData({ title: "Changes saved successfully" });
    }
    setName("");
    setDescription("");
    setOpen(false);
  }

  return (
    <BaseModal open={open} setOpen={setOpen} size="small">
      <BaseModal.Header description="Detail about Folder">
        {isNew?(
          <span className="pr-2">New Folder</span>
        ):(
          <span className="pr-2">Edit Folder</span>
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
          Save
        </Button>
        {!isNew&&(
          <Button onClick={()=>{
            let index = flows.findIndex((flow) => flow.folder_id === folderId);
            if (index >= 0) {
              setErrorData({title:"These is a notbook belong it, the Folder can't be deleted. "});
            }else{
              removeFolder(folderId);
              setName("");
              setDescription("");
              setOpen(false);
              setSuccessData({ title: "Delete Folder successfully" })
              let url="/flow/"+loginUserId;
              navigate(url);
              
            }
            }} type="button" className="mx-2" variant={"secondary"}>
              <IconComponent name="Trash2" className="h-4 w-4 mr-2" />
            Delete
          </Button>  
        )}        
      </BaseModal.Footer>
    </BaseModal>
  );
}
